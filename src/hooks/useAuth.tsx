import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  fetchUserProfileWithRetry,
  getRateLimitState,
  requestPasswordReset,
  resolveSecurityStatus,
  refreshUser,
  setupTOTP,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges,
  verifyTOTP,
} from '../services/authService';
import type {
  AuthActionResult,
  AuthState,
  RateLimitState,
  SignInInput,
  SignUpInput,
} from '../types/auth';

interface AuthContextValue {
  authState: AuthState;
  cooldownState: RateLimitState;
  signIn: (input: SignInInput) => Promise<AuthActionResult<{ user: User }>>;
  signUp: (input: SignUpInput) => Promise<AuthActionResult<{ user: User }>>;
  signOut: () => Promise<AuthActionResult>;
  sendPasswordReset: (
    email: string,
  ) => Promise<AuthActionResult<{ message: string }>>;
  setupTotp: () => Promise<AuthActionResult<{ secret: string; qrUri: string }>>;
  verifyTotp: (token: string) => Promise<AuthActionResult<{ valid: boolean }>>;
  refreshAuthState: (forceRefresh?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadingState(message: string | null): AuthState {
  return {
    status: 'loading',
    message,
  };
}

function unauthenticatedState(message: string | null): AuthState {
  return {
    status: 'unauthenticated',
    message,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(
    loadingState('Checking authentication...'),
  );
  const [cooldownState, setCooldownState] = useState<RateLimitState>(
    getRateLimitState(),
  );
  const sequenceRef = useRef(0);

  const applyUserState = useCallback(
    async (
      incomingUser: User | null,
      options: {
        forceRefresh: boolean;
      } = { forceRefresh: false },
    ) => {
      const currentSequence = ++sequenceRef.current;

      if (!incomingUser) {
        setAuthState(unauthenticatedState(null));
        return;
      }

      try {
        const user = options.forceRefresh
          ? await refreshUser(incomingUser)
          : incomingUser;

        const security = await resolveSecurityStatus(user, options.forceRefresh);
        const relaxedSecurity = {
          ...security,
          // TODO(auth-verification-coming-soon): Re-enable verification gate when email + TOTP flow is shipped.
          isReady: true,
          // TODO(auth-verification-coming-soon): Restore missing verification steps when gating is re-enabled.
          missingSteps: [],
        };
        if (currentSequence !== sequenceRef.current) {
          return;
        }

        setAuthState({
          // TODO(auth-verification-coming-soon): Restore conditional status based on verification readiness.
          // status: security.isReady
          //   ? 'authenticated_ready'
          //   : 'authenticated_pending',
          status: 'authenticated_ready',
          user,
          security: relaxedSecurity,
          profile: null,
          profileStatus: 'loading',
          message: null,
        });

        const profileResult = await fetchUserProfileWithRetry(user.uid);
        if (currentSequence !== sequenceRef.current) {
          return;
        }

        if (profileResult.sessionInvalid) {
          await signOutUser();
          setAuthState(unauthenticatedState(profileResult.message));
          return;
        }

        setAuthState({
          // TODO(auth-verification-coming-soon): Restore conditional status based on verification readiness.
          // status: security.isReady
          //   ? 'authenticated_ready'
          //   : 'authenticated_pending',
          status: 'authenticated_ready',
          user,
          security: relaxedSecurity,
          profile: profileResult.profile,
          profileStatus: profileResult.profileStatus,
          message: profileResult.message,
        });
      } catch (_error) {
        setAuthState(
          unauthenticatedState('Your session is no longer valid. Please sign in again.'),
        );
      }
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      void applyUserState(user);
    });

    return () => {
      sequenceRef.current += 1;
      unsubscribe();
    };
  }, [applyUserState]);

  useEffect(() => {
    const shouldPollForUpdates =
      authState.status === 'authenticated_pending' ||
      (authState.status === 'authenticated_ready' &&
        authState.profileStatus === 'loading');

    if (!shouldPollForUpdates) {
      return;
    }

    const interval = window.setInterval(() => {
      void applyUserState(auth.currentUser, { forceRefresh: true });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [authState, applyUserState]);

  const signIn = useCallback(
    async (input: SignInInput) => {
      const result = await signInWithEmail(input);
      setCooldownState(getRateLimitState());

      if (result.ok && result.data) {
        await applyUserState(result.data.user, { forceRefresh: true });
      }

      return result;
    },
    [applyUserState],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      const result = await signUpWithEmail(input);

      if (result.ok && result.data) {
        await applyUserState(result.data.user, { forceRefresh: true });
      }

      return result;
    },
    [applyUserState],
  );

  const signOut = useCallback(async () => {
    const result = await signOutUser();

    if (result.ok) {
      sequenceRef.current += 1;
      setAuthState(unauthenticatedState(null));
    }

    return result;
  }, []);

  const sendPasswordReset = useCallback((email: string) => {
    return requestPasswordReset(email);
  }, []);

  const setupTotp = useCallback(() => {
    return setupTOTP();
  }, []);

  const verifyTotp = useCallback(
    async (token: string) => {
      const result = await verifyTOTP(token);

      if (result.ok) {
        await applyUserState(auth.currentUser, { forceRefresh: true });
      }

      return result;
    },
    [applyUserState],
  );

  const refreshAuthState = useCallback(
    async (forceRefresh = true) => {
      await applyUserState(auth.currentUser, { forceRefresh });
    },
    [applyUserState],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      cooldownState,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      setupTotp,
      verifyTotp,
      refreshAuthState,
    }),
    [
      authState,
      cooldownState,
      refreshAuthState,
      sendPasswordReset,
      setupTotp,
      signIn,
      signOut,
      signUp,
      verifyTotp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
