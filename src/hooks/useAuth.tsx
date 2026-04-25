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
  requestEmailVerification,
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
  sendEmailVerification: () => Promise<AuthActionResult<{ message: string }>>;
  setupTotp: () => Promise<AuthActionResult<{ secret: string; qrUri: string }>>;
  verifyTotp: (token: string) => Promise<AuthActionResult<{ valid: boolean }>>;
  refreshAuthState: (forceRefresh?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILE_RETRY_INTERVAL_MS = 7000;
const PROFILE_RETRY_TIMEOUT_MS = 60 * 1000;

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
  const profileRetryWindowRef = useRef<{
    uid: string;
    startedAt: number;
  } | null>(null);

  const applyUserState = useCallback(
    async (
      incomingUser: User | null,
      options: {
        forceRefresh: boolean;
      } = { forceRefresh: false },
    ) => {
      const currentSequence = ++sequenceRef.current;

      if (!incomingUser) {
        profileRetryWindowRef.current = null;
        setAuthState(unauthenticatedState(null));
        return;
      }

      try {
        const user = options.forceRefresh
          ? await refreshUser(incomingUser)
          : incomingUser;

        const security = await resolveSecurityStatus(user, options.forceRefresh);
        if (currentSequence !== sequenceRef.current) {
          return;
        }

        setAuthState({
          status: security.isReady
            ? 'authenticated_ready'
            : 'authenticated_pending',
          user,
          security,
          profile: null,
          profileStatus: 'loading',
          message: null,
        });

        const profileResult = await fetchUserProfileWithRetry(user.uid);
        if (currentSequence !== sequenceRef.current) {
          return;
        }

        if (profileResult.sessionInvalid) {
          profileRetryWindowRef.current = null;
          await signOutUser();
          setAuthState(unauthenticatedState(profileResult.message));
          return;
        }

        if (profileResult.profileStatus === 'loading') {
          const existingWindow = profileRetryWindowRef.current;
          if (!existingWindow || existingWindow.uid !== user.uid) {
            profileRetryWindowRef.current = {
              uid: user.uid,
              startedAt: Date.now(),
            };
          }

          const retryWindow = profileRetryWindowRef.current;
          if (
            retryWindow &&
            Date.now() - retryWindow.startedAt >= PROFILE_RETRY_TIMEOUT_MS
          ) {
            profileRetryWindowRef.current = null;
            setAuthState({
              status: security.isReady
                ? 'authenticated_ready'
                : 'authenticated_pending',
              user,
              security,
              profile: null,
              profileStatus: 'ready',
              message: null,
            });
            return;
          }
        } else {
          profileRetryWindowRef.current = null;
        }

        setAuthState({
          status: security.isReady
            ? 'authenticated_ready'
            : 'authenticated_pending',
          user,
          security,
          profile: profileResult.profile,
          profileStatus: profileResult.profileStatus,
          message: profileResult.message,
        });
      } catch (_error) {
        profileRetryWindowRef.current = null;
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
    const canRetryProfileLoading =
      authState.status === 'authenticated_ready' &&
      authState.profileStatus === 'loading' &&
      (() => {
        const retryWindow = profileRetryWindowRef.current;
        if (!retryWindow) {
          return true;
        }

        return Date.now() - retryWindow.startedAt < PROFILE_RETRY_TIMEOUT_MS;
      })();

    const shouldPollForUpdates =
      authState.status === 'authenticated_pending' || canRetryProfileLoading;

    if (!shouldPollForUpdates) {
      return;
    }

    const interval = window.setInterval(() => {
      void applyUserState(auth.currentUser, { forceRefresh: true });
    }, PROFILE_RETRY_INTERVAL_MS);

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
      profileRetryWindowRef.current = null;
      sequenceRef.current += 1;
      setAuthState(unauthenticatedState(null));
    }

    return result;
  }, []);

  const sendPasswordReset = useCallback((email: string) => {
    return requestPasswordReset(email);
  }, []);

  const sendEmailVerification = useCallback(() => {
    return requestEmailVerification();
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
      sendEmailVerification,
      setupTotp,
      verifyTotp,
      refreshAuthState,
    }),
    [
      authState,
      cooldownState,
      refreshAuthState,
      sendEmailVerification,
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
