import type { VerificationStep } from '../types/auth';

export const AUTH_COPY = {
  shellProfileLoading:
    'Profile loading... You can continue using the app while we retry in the background.',
  gateTitlePending: 'Finish Security Setup',
  gateTitleSignIn: 'Sign In Required',
  gateBodyPending:
    'Your account is signed in, but protected actions stay blocked until all security steps are complete.',
  gateBodySignIn:
    'Sign in with email and password to access authenticated views and protected actions.',
  gateOpenAuthPending: 'Open Auth Modal',
  gateOpenAuthSignIn: 'Open Sign In',
  gateRefreshStatus: 'Refresh Status',
  modalTitlePending: 'Complete your security setup',
  modalTitleDefault: 'Enter your sanctuary',
  modalSuccessReady: 'Authentication complete. Protected actions are now unlocked.',
  modalSuccessSignIn: 'Sign in successful.',
  modalSuccessSignUp:
    'Account created. Complete verification to unlock protected actions.',
  modalSuccessTotpSetup:
    'TOTP setup initialized. Scan the URI with your authenticator app.',
  modalSuccessTotpVerified: 'Authenticator verified. Refreshing account status...',
  modalSignInErrorFallback: 'Sign in failed. Please try again.',
  modalSignUpErrorFallback: 'Registration failed. Please try again.',
  modalResetErrorFallback: 'Unable to process reset right now.',
  modalTotpSetupErrorFallback: 'Unable to start TOTP setup right now.',
  modalTotpVerifyErrorFallback: 'Invalid authentication code.',
  modalEmailPasswordOnly: 'Email/password only in this release',
  modalSecureEmailFlow: 'secure email flow',
  modalEmailVerificationComingSoon: 'Email verification: Coming soon.',
  modalTwoFactorComingSoon: 'Two-factor verification (TOTP): Coming soon.',
  modalCooldown:
    'Sign in is temporarily disabled. Retry in approximately {seconds} second(s).',
} as const;

export const VERIFICATION_STEP_COPY: Record<
  VerificationStep,
  {
    title: string;
    body: string;
  }
> = {
  email_verification: {
    title: 'Verify your email address',
    body: 'Open the verification link sent to your inbox, then refresh your status.',
  },
  totp_setup: {
    title: 'Finish TOTP setup',
    body: 'Open the auth modal and complete authenticator app setup to unlock protected actions.',
  },
};
