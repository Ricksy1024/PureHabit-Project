import { FirebaseError } from 'firebase/app';
import {
  type User,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, isFirebaseConfigured } from '../config/firebase';
import type {
  AuthActionResult,
  AuthSecurityStatus,
  FieldErrors,
  ProfileFetchResult,
  RateLimitState,
  SignInInput,
  SignUpInput,
  UserProfile,
  VerificationStep,
} from '../types/auth';

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const COOLDOWN_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

const CONNECTIVITY_ERROR =
  'Unable to connect. Check your connection and try again.';

let rateLimitState: RateLimitState = {
  attempts: 0,
  windowStart: Date.now(),
  cooldownUntil: null,
};

function now() {
  return Date.now();
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function ensureFirebaseConfigured<TData = void>(): AuthActionResult<TData> | null {
  if (isFirebaseConfigured) {
    return null;
  }

  return {
    ok: false,
    error: 'Firebase is not configured. Set VITE_FIREBASE_* values in .env.',
    errorCode: 'client/firebase-not-configured',
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function slideRateLimitWindow(currentTime: number) {
  if (currentTime - rateLimitState.windowStart > ATTEMPT_WINDOW_MS) {
    rateLimitState = {
      attempts: 0,
      windowStart: currentTime,
      cooldownUntil: null,
    };
  }

  if (rateLimitState.cooldownUntil && currentTime >= rateLimitState.cooldownUntil) {
    rateLimitState = {
      attempts: 0,
      windowStart: currentTime,
      cooldownUntil: null,
    };
  }
}

function getErrorCode(error: unknown): string {
  if (error instanceof FirebaseError) {
    return error.code;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }

  return 'unknown';
}

function mapAuthError<TData = void>(error: unknown): AuthActionResult<TData> {
  const code = getErrorCode(error);

  switch (code) {
    case 'auth/user-not-found':
      return {
        ok: false,
        error: 'No account found with this email.',
        fieldErrors: { email: 'No account found with this email.' },
        errorCode: code,
      };
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        ok: false,
        error: 'Incorrect password. Try again or reset your password.',
        fieldErrors: { password: 'Incorrect password. Try again or reset your password.' },
        errorCode: code,
      };
    case 'auth/invalid-email':
      return {
        ok: false,
        error: 'Please enter a valid email address.',
        fieldErrors: { email: 'Please enter a valid email address.' },
        errorCode: code,
      };
    case 'auth/email-already-in-use':
      return {
        ok: false,
        error: 'An account already exists with this email.',
        fieldErrors: { email: 'An account already exists with this email.' },
        errorCode: code,
      };
    case 'auth/weak-password':
      return {
        ok: false,
        error: 'Password must be at least 6 characters.',
        fieldErrors: { password: 'Password must be at least 6 characters.' },
        errorCode: code,
      };
    case 'auth/user-disabled':
      return {
        ok: false,
        error: 'This account has been disabled.',
        errorCode: code,
      };
    case 'auth/network-request-failed':
      return {
        ok: false,
        error: CONNECTIVITY_ERROR,
        errorCode: code,
      };
    case 'auth/too-many-requests': {
      const cooldownUntil = now() + COOLDOWN_MS;
      rateLimitState = {
        ...rateLimitState,
        attempts: MAX_FAILED_ATTEMPTS,
        cooldownUntil,
      };
      return {
        ok: false,
        error: 'Too many attempts. Please wait 15 minutes and try again.',
        errorCode: code,
      };
    }
    default:
      return {
        ok: false,
        error: 'Authentication failed. Please try again.',
        errorCode: code,
      };
  }
}

function mapCallableError<TData = void>(error: unknown): AuthActionResult<TData> {
  const code = getErrorCode(error);

  switch (code) {
    case 'functions/unavailable':
    case 'functions/internal':
    case 'auth/network-request-failed':
      return {
        ok: false,
        error: CONNECTIVITY_ERROR,
        errorCode: code,
      };
    case 'functions/unauthenticated':
      return {
        ok: false,
        error: 'You need to sign in again to continue.',
        errorCode: code,
      };
    case 'functions/invalid-argument':
      return {
        ok: false,
        error: 'Please enter a valid 6-digit authentication code.',
        fieldErrors: { token: 'Please enter a valid 6-digit authentication code.' },
        errorCode: code,
      };
    default:
      return {
        ok: false,
        error:
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
            ? (error as { message: string }).message
            : 'Request failed. Please try again.',
        errorCode: code,
      };
  }
}

function createCooldownError<TData = void>(): AuthActionResult<TData> {
  const remainingMinutes = Math.max(
    1,
    Math.ceil(getCooldownRemainingMs() / 60000),
  );

  return {
    ok: false,
    error: `Too many failed attempts. Please wait ${remainingMinutes} minute(s) before trying again.`,
    errorCode: 'client/cooldown',
  };
}

function withFieldError<TData = void>(
  fieldErrors: FieldErrors,
): AuthActionResult<TData> {
  return {
    ok: false,
    error: 'Please correct the highlighted fields.',
    fieldErrors,
    errorCode: 'client/validation',
  };
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return 'Email is required.';
  }

  const normalized = normalizeEmail(email);
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(normalized)) {
    return 'Please enter a valid email address.';
  }

  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password.trim()) {
    return 'Password is required.';
  }

  return undefined;
}

function validateSignInInput(input: SignInInput): FieldErrors {
  return {
    email: validateEmail(input.email),
    password: validatePassword(input.password),
  };
}

function validateSignUpInput(input: SignUpInput): FieldErrors {
  return {
    displayName: !input.displayName.trim()
      ? 'Name is required.'
      : undefined,
    email: validateEmail(input.email),
    password:
      !input.password.trim()
        ? 'Password is required.'
        : input.password.length < 6
          ? 'Password must be at least 6 characters.'
          : undefined,
  };
}

function hasValidationErrors(fieldErrors: FieldErrors): boolean {
  return Object.values(fieldErrors).some(Boolean);
}

function registerSignInFailure(currentTime = now()) {
  slideRateLimitWindow(currentTime);

  const attempts = rateLimitState.attempts + 1;
  const cooldownUntil =
    attempts >= MAX_FAILED_ATTEMPTS ? currentTime + COOLDOWN_MS : null;

  rateLimitState = {
    attempts,
    windowStart: rateLimitState.windowStart || currentTime,
    cooldownUntil,
  };
}

function clearSignInFailures() {
  rateLimitState = {
    attempts: 0,
    windowStart: now(),
    cooldownUntil: null,
  };
}

export function getRateLimitState(currentTime = now()): RateLimitState {
  slideRateLimitWindow(currentTime);
  return { ...rateLimitState };
}

export function getCooldownRemainingMs(currentTime = now()): number {
  slideRateLimitWindow(currentTime);
  if (!rateLimitState.cooldownUntil) {
    return 0;
  }

  return Math.max(0, rateLimitState.cooldownUntil - currentTime);
}

export function subscribeToAuthChanges(
  callback: (user: User | null) => void,
) {
  return onIdTokenChanged(auth, callback);
}

export async function signInWithEmail(
  input: SignInInput,
): Promise<AuthActionResult<{ user: User }>> {
  const configurationError = ensureFirebaseConfigured<{ user: User }>();
  if (configurationError) {
    return configurationError;
  }

  const fieldErrors = validateSignInInput(input);
  if (hasValidationErrors(fieldErrors)) {
    return withFieldError(fieldErrors);
  }

  if (getCooldownRemainingMs() > 0) {
    return createCooldownError();
  }

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizeEmail(input.email),
      input.password,
    );

    clearSignInFailures();

    return {
      ok: true,
      data: {
        user: credential.user,
      },
    };
  } catch (error) {
    registerSignInFailure();
    return mapAuthError(error);
  }
}

export async function signUpWithEmail(
  input: SignUpInput,
): Promise<AuthActionResult<{ user: User }>> {
  const configurationError = ensureFirebaseConfigured<{ user: User }>();
  if (configurationError) {
    return configurationError;
  }

  const fieldErrors = validateSignUpInput(input);
  if (hasValidationErrors(fieldErrors)) {
    return withFieldError(fieldErrors);
  }

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizeEmail(input.email),
      input.password,
    );

    const displayName = input.displayName.trim();
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    return {
      ok: true,
      data: {
        user: credential.user,
      },
    };
  } catch (error) {
    return mapAuthError(error);
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<AuthActionResult<{ message: string }>> {
  const configurationError = ensureFirebaseConfigured<{ message: string }>();
  if (configurationError) {
    return configurationError;
  }

  const validationMessage = validateEmail(email);
  if (validationMessage) {
    return {
      ok: false,
      error: validationMessage,
      fieldErrors: {
        email: validationMessage,
      },
      errorCode: 'client/validation',
    };
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    await sendPasswordResetEmail(auth, normalizedEmail);
    return {
      ok: true,
      data: {
        message:
          'If an account exists for this email, password reset instructions have been sent.',
      },
    };
  } catch (error) {
    const code = getErrorCode(error);
    if (code === 'auth/network-request-failed') {
      return {
        ok: false,
        error: CONNECTIVITY_ERROR,
        errorCode: code,
      };
    }

    return {
      ok: true,
      data: {
        message:
          'If an account exists for this email, password reset instructions have been sent.',
      },
    };
  }
}

export async function signOutUser(): Promise<AuthActionResult> {
  const configurationError = ensureFirebaseConfigured();
  if (configurationError) {
    return configurationError;
  }

  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    return mapAuthError(error);
  }
}

export async function setupTOTP(): Promise<
  AuthActionResult<{ secret: string; qrUri: string }>
> {
  const configurationError = ensureFirebaseConfigured<{
    secret: string;
    qrUri: string;
  }>();
  if (configurationError) {
    return configurationError;
  }

  try {
    const callable = httpsCallable<
      Record<string, never>,
      { success: boolean; secret: string; qrUri: string }
    >(functions, 'setupTOTP');
    const result = await callable({});

    return {
      ok: true,
      data: {
        secret: result.data.secret,
        qrUri: result.data.qrUri,
      },
    };
  } catch (error) {
    return mapCallableError(error);
  }
}

export async function verifyTOTP(
  token: string,
): Promise<AuthActionResult<{ valid: boolean }>> {
  const configurationError = ensureFirebaseConfigured<{ valid: boolean }>();
  if (configurationError) {
    return configurationError;
  }

  const normalizedToken = token.trim();
  if (!/^\d{6}$/.test(normalizedToken)) {
    return {
      ok: false,
      error: 'Please enter a valid 6-digit authentication code.',
      fieldErrors: {
        token: 'Please enter a valid 6-digit authentication code.',
      },
      errorCode: 'client/validation',
    };
  }

  try {
    const callable = httpsCallable<
      { token: string },
      { success: boolean; valid: boolean }
    >(functions, 'verifyTOTP');
    const result = await callable({ token: normalizedToken });

    if (!result.data.valid) {
      return {
        ok: false,
        error: 'Invalid authentication code. Please try again.',
        fieldErrors: {
          token: 'Invalid authentication code. Please try again.',
        },
        errorCode: 'client/invalid-totp',
      };
    }

    return {
      ok: true,
      data: {
        valid: true,
      },
    };
  } catch (error) {
    return mapCallableError(error);
  }
}

export async function resolveSecurityStatus(
  user: User,
  forceRefresh = false,
): Promise<AuthSecurityStatus> {
  const tokenResult = await user.getIdTokenResult(forceRefresh);
  const emailVerified = user.emailVerified === true;
  const totpVerified = tokenResult.claims.totpVerified === true;

  const missingSteps: VerificationStep[] = [];
  if (!emailVerified) {
    missingSteps.push('email_verification');
  }
  if (!totpVerified) {
    missingSteps.push('totp_setup');
  }

  return {
    emailVerified,
    totpVerified,
    isReady: missingSteps.length === 0,
    missingSteps,
  };
}

export async function refreshUser(user: User): Promise<User> {
  await user.reload();
  return auth.currentUser || user;
}

function isSessionConflictCode(code: string) {
  return (
    code === 'unauthenticated' ||
    code === 'auth/user-token-expired' ||
    code === 'auth/user-disabled' ||
    code === 'auth/user-not-found'
  );
}

async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as {
    email?: unknown;
    timezone?: unknown;
    totp?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
  };

  let totpEnabled = false;
  if (
    data.totp &&
    typeof data.totp === 'object' &&
    'enabled' in data.totp &&
    typeof (data.totp as { enabled: unknown }).enabled === 'boolean'
  ) {
    totpEnabled = (data.totp as { enabled: boolean }).enabled;
  }

  return {
    id: uid,
    email: typeof data.email === 'string' ? data.email : null,
    timezone: typeof data.timezone === 'string' ? data.timezone : null,
    totp: {
      enabled: totpEnabled,
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function fetchUserProfileWithRetry(
  uid: string,
): Promise<ProfileFetchResult> {
  const delays = [0, 1000, 2000, 4000];
  let missingProfile = false;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    const waitDuration = delays[attempt];
    if (waitDuration > 0) {
      await delay(waitDuration);
    }

    try {
      const profile = await fetchUserProfile(uid);
      if (profile) {
        return {
          profile,
          profileStatus: 'ready',
          sessionInvalid: false,
          message: null,
        };
      }

      missingProfile = true;
    } catch (error) {
      lastError = error;
      const code = getErrorCode(error);
      if (isSessionConflictCode(code)) {
        return {
          profile: null,
          profileStatus: 'error',
          sessionInvalid: true,
          message: 'Your session is no longer valid. Please sign in again.',
        };
      }
    }
  }

  if (missingProfile) {
    return {
      profile: null,
      profileStatus: 'loading',
      sessionInvalid: false,
      message: 'Profile loading... Retrying in the background.',
    };
  }

  const errorCode = getErrorCode(lastError);
  if (errorCode === 'unavailable' || errorCode === 'deadline-exceeded') {
    return {
      profile: null,
      profileStatus: 'loading',
      sessionInvalid: false,
      message: 'Profile loading... Retrying in the background.',
    };
  }

  return {
    profile: null,
    profileStatus: 'error',
    sessionInvalid: false,
    message: CONNECTIVITY_ERROR,
  };
}
