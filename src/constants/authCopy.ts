import type { VerificationStep } from '../types/auth';

export const AUTH_COPY = {
  shellProfileLoading:
    'Profile loading... You can continue using the app while we retry in the background.',
  gateTitlePending: 'Verify Your Email',
  gateTitleSignIn: 'Sign In Required',
  gateBodyPending:
    'Your account exists, but app features stay locked until you verify your email address.',
  gateBodySignIn:
    'Sign in with email and password to access authenticated views and protected actions.',
  gateOpenAuthPending: 'Open Auth Modal',
  gateOpenAuthSignIn: 'Open Sign In',
  gateRefreshStatus: 'Refresh Status',
  modalTitlePending: 'Verify your email to continue',
  modalTitleTotp: 'Unlock protected settings',
  modalTitleDefault: 'Enter your sanctuary',
  modalSuccessReady: 'Authentication complete. Protected actions are now unlocked.',
  modalSuccessSignIn: 'Sign in successful.',
  modalSuccessSignUp:
    'Account created. We sent a verification email to your inbox.',
  modalSuccessEmailVerification:
    'Verification email sent. Check your inbox and spam folder.',
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
  modalResendVerification: 'Resend verification email',
  modalEmailVerificationComingSoon: 'Email verification is now required before app access.',
  modalTwoFactorComingSoon: 'Two-factor verification (TOTP) is not required for app access.',
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
    body: 'Open the verification link sent to your inbox, then refresh your status to unlock the app.',
  },
  totp_setup: {
    title: 'Finish TOTP setup',
    body: 'Open the auth modal and complete authenticator app setup to unlock protected actions.',
  },
};
