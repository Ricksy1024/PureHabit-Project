import type { User } from 'firebase/auth';

export type VerificationStep = 'email_verification' | 'totp_setup';

export interface AuthSecurityStatus {
  emailVerified: boolean;
  totpVerified: boolean;
  isReady: boolean;
  missingSteps: VerificationStep[];
}

export interface UserProfile {
  id: string;
  email: string | null;
  timezone: string | null;
  totp: {
    enabled: boolean;
  } | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuthenticatedState {
  user: User;
  security: AuthSecurityStatus;
  profile: UserProfile | null;
  profileStatus: 'loading' | 'ready' | 'error';
}

export type AuthState =
  | {
      status: 'loading';
      message: string | null;
    }
  | {
      status: 'unauthenticated';
      message: string | null;
    }
  | ({
      status: 'authenticated_pending';
      message: string | null;
    } & AuthenticatedState)
  | ({
      status: 'authenticated_ready';
      message: string | null;
    } & AuthenticatedState);

export interface FieldErrors {
  email?: string;
  password?: string;
  displayName?: string;
  token?: string;
}

export interface AuthActionResult<TData = void> {
  ok: boolean;
  data?: TData;
  error?: string;
  fieldErrors?: FieldErrors;
  errorCode?: string;
}

export interface RateLimitState {
  attempts: number;
  windowStart: number;
  cooldownUntil: number | null;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  displayName: string;
  email: string;
  password: string;
}

export interface ProfileFetchResult {
  profile: UserProfile | null;
  profileStatus: 'ready' | 'loading' | 'error';
  sessionInvalid: boolean;
  message: string | null;
}
