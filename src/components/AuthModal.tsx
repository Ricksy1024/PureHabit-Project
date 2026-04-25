import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { FieldErrors } from '../types/auth';
import { AUTH_COPY } from '../constants/authCopy';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  mode?: 'default' | 'totp';
}

interface FormState {
  displayName: string;
  email: string;
  password: string;
  error: string | null;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
}

const EMPTY_FORM: FormState = {
  displayName: '',
  email: '',
  password: '',
  error: null,
  fieldErrors: {},
  isSubmitting: false,
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  mode = 'default',
}) => {
  const {
    authState,
    cooldownState,
    signIn,
    signUp,
    sendPasswordReset,
    sendEmailVerification,
    setupTotp,
    verifyTotp,
    refreshAuthState,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signInForm, setSignInForm] = useState<FormState>(EMPTY_FORM);
  const [signUpForm, setSignUpForm] = useState<FormState>(EMPTY_FORM);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<{ secret: string; qrUri: string } | null>(null);
  const [totpToken, setTotpToken] = useState('');
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpPending, setTotpPending] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);

  const isAuthenticated =
    authState.status === 'authenticated_ready' ||
    authState.status === 'authenticated_pending';
  const emailVerified = isAuthenticated ? authState.security.emailVerified : false;
  const totpVerified = isAuthenticated ? authState.security.totpVerified : false;
  const missingSteps =
    authState.status === 'authenticated_pending'
      ? authState.security.missingSteps
      : [];
  const isPendingAuth = authState.status === 'authenticated_pending';
  const isTotpMode =
    mode === 'totp' &&
    isAuthenticated &&
    emailVerified &&
    !totpVerified;
  const needsStoredTotpVerification =
    isTotpMode &&
    authState.profile?.totp?.enabled === true;

  const cooldownSeconds = useMemo(() => {
    if (!cooldownState.cooldownUntil) {
      return 0;
    }

    return Math.max(0, Math.ceil((cooldownState.cooldownUntil - Date.now()) / 1000));
  }, [cooldownState.cooldownUntil]);

  useEffect(() => {
    const defaultFlowCompleted =
      mode === 'default' && authState.status === 'authenticated_ready';
    const totpFlowCompleted =
      mode === 'totp' &&
      isAuthenticated &&
      emailVerified &&
      totpVerified;

    if (isOpen && (defaultFlowCompleted || totpFlowCompleted)) {
      setBannerMessage(AUTH_COPY.modalSuccessReady);
      onClose();
    }
  }, [authState.status, emailVerified, isAuthenticated, isOpen, mode, onClose, totpVerified]);

  const updateSignInField = (field: keyof FormState, value: string) => {
    setSignInForm((previous) => ({
      ...previous,
      [field]: value,
      error: null,
      fieldErrors: {
        ...previous.fieldErrors,
        [field]: undefined,
      },
    }));
  };

  const updateSignUpField = (field: keyof FormState, value: string) => {
    setSignUpForm((previous) => ({
      ...previous,
      [field]: value,
      error: null,
      fieldErrors: {
        ...previous.fieldErrors,
        [field]: undefined,
      },
    }));
  };

  const handleSignInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setSignInForm((previous) => ({
      ...previous,
      isSubmitting: true,
      error: null,
      fieldErrors: {},
    }));

    const result = await signIn({
      email: signInForm.email,
      password: signInForm.password,
    });

    if (!result.ok) {
      setSignInForm((previous) => ({
        ...previous,
        isSubmitting: false,
        error: result.error || AUTH_COPY.modalSignInErrorFallback,
        fieldErrors: result.fieldErrors || {},
      }));
      return;
    }

    setBannerMessage(AUTH_COPY.modalSuccessSignIn);
    setSignInForm((previous) => ({
      ...previous,
      isSubmitting: false,
      error: null,
      fieldErrors: {},
    }));
  };

  const handleSignUpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setSignUpForm((previous) => ({
      ...previous,
      isSubmitting: true,
      error: null,
      fieldErrors: {},
    }));

    const result = await signUp({
      displayName: signUpForm.displayName,
      email: signUpForm.email,
      password: signUpForm.password,
    });

    if (!result.ok) {
      setSignUpForm((previous) => ({
        ...previous,
        isSubmitting: false,
        error: result.error || AUTH_COPY.modalSignUpErrorFallback,
        fieldErrors: result.fieldErrors || {},
      }));
      return;
    }

    setBannerMessage(AUTH_COPY.modalSuccessSignUp);
    setSignUpForm((previous) => ({
      ...previous,
      isSubmitting: false,
      error: null,
      fieldErrors: {},
    }));
  };

  const handleForgotPassword = async () => {
    setSignInForm((previous) => ({
      ...previous,
      error: null,
      fieldErrors: {},
    }));

    const result = await sendPasswordReset(signInForm.email);
    if (!result.ok) {
      setSignInForm((previous) => ({
        ...previous,
        error: result.error || AUTH_COPY.modalResetErrorFallback,
        fieldErrors: result.fieldErrors || {},
      }));
      return;
    }

    setBannerMessage(result.data?.message || 'Reset request accepted.');
  };

  const handleResendVerification = async () => {
    setVerificationPending(true);
    setSignInForm((previous) => ({
      ...previous,
      error: null,
      fieldErrors: {},
    }));

    const result = await sendEmailVerification();
    setVerificationPending(false);

    if (!result.ok) {
      setSignInForm((previous) => ({
        ...previous,
        error: result.error || AUTH_COPY.modalSignInErrorFallback,
        fieldErrors: result.fieldErrors || {},
      }));
      return;
    }

    setBannerMessage(result.data?.message || AUTH_COPY.modalSuccessEmailVerification);
  };

  const handleSetupTotp = async () => {
    setTotpPending(true);
    setTotpError(null);

    const result = await setupTotp();
    setTotpPending(false);

    if (!result.ok || !result.data) {
      setTotpError(result.error || AUTH_COPY.modalTotpSetupErrorFallback);
      return;
    }

    setTotpSecret(result.data);
    setBannerMessage(AUTH_COPY.modalSuccessTotpSetup);
  };

  const handleVerifyTotp = async () => {
    setTotpPending(true);
    setTotpError(null);

    const result = await verifyTotp(totpToken);
    setTotpPending(false);

    if (!result.ok) {
      setTotpError(result.error || AUTH_COPY.modalTotpVerifyErrorFallback);
      return;
    }

    setBannerMessage(AUTH_COPY.modalSuccessTotpVerified);
    setTotpToken('');
    await refreshAuthState(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? 'linear-gradient(-45deg, #1a1210, #2A2421, #4A2C24, #6b3a2e)'
                : 'linear-gradient(-45deg, #f5f5dc, #e9e4d4, #C06C5D, #d6816a)',
              backgroundSize: '400% 400%',
              animation: 'authMeshGradient 15s ease infinite',
            }}
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          <motion.section
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 0.98, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-130 max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl shadow-2xl"
            style={{
              background: isDarkMode
                ? 'rgba(42, 36, 33, 0.85)'
                : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: isDarkMode
                ? '1px solid rgba(74, 44, 36, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`absolute top-5 right-5 z-20 p-2 rounded-full transition-colors ${
                isDarkMode
                  ? 'text-[#A58876] hover:text-[#FDF8F3] hover:bg-[#4A2C24]/50'
                  : 'text-[#8A7E7A] hover:text-[#2A2421] hover:bg-black/5'
              }`}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="p-8 md:p-10">
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="inline-flex items-center space-x-2 text-[#C06C5D] mb-4">
                  <Sparkles className="w-8 h-8" />
                  <span className="font-serif italic text-2xl tracking-tight">PureHabit</span>
                </div>
                <h1
                  className={`text-3xl md:text-4xl font-serif italic tracking-tight ${
                    isDarkMode ? 'text-[#FDF8F3]' : 'text-[#3a2e2a]'
                  }`}
                >
                  {isPendingAuth
                    ? AUTH_COPY.modalTitlePending
                    : isTotpMode
                      ? AUTH_COPY.modalTitleTotp
                      : AUTH_COPY.modalTitleDefault}
                </h1>
              </div>

              {bannerMessage && (
                <div
                  className={`mb-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
                    isDarkMode
                      ? 'bg-[#2f5b42]/30 text-[#d7ffe8]'
                      : 'bg-[#e2f8ea] text-[#224f37]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{bannerMessage}</span>
                </div>
              )}

              {authState.message && (
                <div
                  className={`mb-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
                    isDarkMode
                      ? 'bg-[#D0705B]/20 text-[#ffd9d2]'
                      : 'bg-[#ffe9e4] text-[#8C3B2B]'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{authState.message}</span>
                </div>
              )}

              {isPendingAuth ? (
                <div className="space-y-5">
                  {missingSteps.includes('email_verification') && (
                    <div
                      className={`rounded-2xl p-4 border ${
                        isDarkMode
                          ? 'border-[#D0705B]/30 bg-[#D0705B]/10'
                          : 'border-[#D0705B]/25 bg-[#fff3ef]'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                        Verify your email address
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#EADCCF]' : 'text-[#4A3E37]'}`}>
                        Open your inbox, click the verification link, and then refresh your account state.
                      </p>
                      <button
                        onClick={() => {
                          void refreshAuthState(true);
                        }}
                        className="mt-3 rounded-xl bg-[#D0705B] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                        type="button"
                      >
                        I have verified my email
                      </button>
                      <button
                        onClick={() => {
                          void handleResendVerification();
                        }}
                        disabled={verificationPending}
                        className="mt-3 ml-3 rounded-xl border border-[#D0705B]/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#D0705B] disabled:opacity-60"
                        type="button"
                      >
                        {verificationPending
                          ? 'Sending...'
                          : AUTH_COPY.modalResendVerification}
                      </button>
                    </div>
                  )}

                </div>
              ) : isTotpMode ? (
                <div
                  className={`rounded-2xl p-4 border ${
                    isDarkMode
                      ? 'border-[#D0705B]/30 bg-[#D0705B]/10'
                      : 'border-[#D0705B]/25 bg-[#fff3ef]'
                  }`}
                >
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                    Authenticator confirmation
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#EADCCF]' : 'text-[#4A3E37]'}`}>
                    {needsStoredTotpVerification
                      ? 'This part of Settings is protected. Enter a fresh 6-digit authenticator code to continue.'
                      : 'Set up your authenticator now, then verify with a 6-digit code to unlock protected settings.'}
                  </p>

                  {!totpSecret && !needsStoredTotpVerification ? (
                    <button
                      onClick={handleSetupTotp}
                      disabled={totpPending}
                      className="mt-3 rounded-xl bg-[#D0705B] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-60"
                      type="button"
                    >
                      {totpPending ? 'Starting...' : 'Start TOTP setup'}
                    </button>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {totpSecret ? (
                        <>
                          <p className={`text-xs break-all ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                            <span className="font-semibold">TOTP URI:</span> {totpSecret.qrUri}
                          </p>
                          <p className={`text-xs break-all ${isDarkMode ? 'text-[#FDF8F3]' : 'text-[#2A2421]'}`}>
                            <span className="font-semibold">Manual secret:</span> {totpSecret.secret}
                          </p>
                        </>
                      ) : null}
                      <input
                        className={`w-full border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C06C5D]/25 ${
                          isDarkMode
                            ? 'bg-[#1a1210]/50 text-[#FDF8F3]'
                            : 'bg-white/65 text-[#3a2e2a]'
                        }`}
                        value={totpToken}
                        onChange={(event) => {
                          setTotpToken(event.target.value);
                          setTotpError(null);
                        }}
                        placeholder="Enter 6-digit authenticator code"
                        inputMode="numeric"
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifyTotp}
                        disabled={totpPending}
                        className="rounded-xl bg-[#D0705B] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-60"
                        type="button"
                      >
                        {totpPending ? 'Verifying...' : 'Verify authenticator code'}
                      </button>
                    </div>
                  )}

                  {totpError && (
                    <p className={`mt-3 text-xs ${isDarkMode ? 'text-[#ffd9d2]' : 'text-[#8C3B2B]'}`}>
                      {totpError}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-center space-x-12 mb-8">
                    <button
                      onClick={() => setActiveTab('signin')}
                      className="group relative pb-2 focus:outline-none"
                      type="button"
                    >
                      <span
                        className={`text-xl font-serif italic transition-opacity duration-300 ${
                          isDarkMode ? 'text-[#FDF8F3]' : 'text-[#3a2e2a]'
                        } ${activeTab !== 'signin' ? 'opacity-40 hover:opacity-100' : ''}`}
                      >
                        Sign In
                      </span>
                      {activeTab === 'signin' && (
                        <motion.span
                          layoutId="authTabIndicator"
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C06C5D] rounded-full"
                        />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className="group relative pb-2 focus:outline-none"
                      type="button"
                    >
                      <span
                        className={`text-xl font-serif italic transition-opacity duration-300 ${
                          isDarkMode ? 'text-[#FDF8F3]' : 'text-[#3a2e2a]'
                        } ${activeTab !== 'signup' ? 'opacity-40 hover:opacity-100' : ''}`}
                      >
                        Sign Up
                      </span>
                      {activeTab === 'signup' && (
                        <motion.span
                          layoutId="authTabIndicator"
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C06C5D] rounded-full"
                        />
                      )}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: activeTab === 'signin' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: activeTab === 'signin' ? 20 : -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <button
                        className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-full shadow-sm transition-all duration-300 border cursor-not-allowed opacity-65 ${
                          isDarkMode
                            ? 'bg-[#2A2421]/60 border-[#4A2C24]/40 text-[#FDF8F3]'
                            : 'bg-white/50 border-white/40 text-[#3a2e2a]'
                        }`}
                        type="button"
                        disabled
                        title="Email/password authentication only in this release"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        <span className="text-sm font-semibold">
                          {AUTH_COPY.modalEmailPasswordOnly}
                        </span>
                      </button>

                      <div className="relative flex py-2 items-center">
                        <div
                          className={`grow border-t ${
                            isDarkMode ? 'border-[#4A2C24]/40' : 'border-[#3a2e2a]/10'
                          }`}
                        />
                        <span
                          className={`shrink mx-4 text-xs uppercase tracking-widest font-medium ${
                            isDarkMode ? 'text-[#A58876]/60' : 'text-[#3a2e2a]/40'
                          }`}
                        >
                          {AUTH_COPY.modalSecureEmailFlow}
                        </span>
                        <div
                          className={`grow border-t ${
                            isDarkMode ? 'border-[#4A2C24]/40' : 'border-[#3a2e2a]/10'
                          }`}
                        />
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 text-xs space-y-1 ${
                          isDarkMode
                            ? 'bg-[#D0705B]/15 text-[#FDF8F3]'
                            : 'bg-[#FFF1EC] text-[#4A3E37]'
                        }`}
                      >
                        <p>{AUTH_COPY.modalEmailVerificationComingSoon}</p>
                        <p>{AUTH_COPY.modalTwoFactorComingSoon}</p>
                      </div>

                      <form
                        className="space-y-5"
                        onSubmit={activeTab === 'signin' ? handleSignInSubmit : handleSignUpSubmit}
                      >
                        {activeTab === 'signup' && (
                          <div className="space-y-1.5">
                            <label
                              className={`block text-[10px] uppercase tracking-[0.2em] ml-4 font-medium ${
                                isDarkMode ? 'text-[#A58876]/80' : 'text-[#7c6d66]/80'
                              }`}
                              htmlFor="auth-name"
                            >
                              Full Name
                            </label>
                            <input
                              className={`w-full border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#C06C5D]/20 shadow-sm transition-all text-sm ${
                                isDarkMode
                                  ? 'bg-[#1a1210]/50 text-[#FDF8F3]'
                                  : 'bg-white/40 text-[#3a2e2a]'
                              }`}
                              id="auth-name"
                              value={signUpForm.displayName}
                              onChange={(event) => updateSignUpField('displayName', event.target.value)}
                              placeholder="Elias Thorne"
                              type="text"
                            />
                            {signUpForm.fieldErrors.displayName && (
                              <p className={`text-xs px-4 ${isDarkMode ? 'text-[#ffd9d2]' : 'text-[#8C3B2B]'}`}>
                                {signUpForm.fieldErrors.displayName}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label
                            className={`block text-[10px] uppercase tracking-[0.2em] ml-4 font-medium ${
                              isDarkMode ? 'text-[#A58876]/80' : 'text-[#7c6d66]/80'
                            }`}
                            htmlFor="auth-email"
                          >
                            Email Address
                          </label>
                          <input
                            className={`w-full border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#C06C5D]/20 shadow-sm transition-all text-sm ${
                              isDarkMode
                                ? 'bg-[#1a1210]/50 text-[#FDF8F3]'
                                : 'bg-white/40 text-[#3a2e2a]'
                            }`}
                            id="auth-email"
                            value={activeTab === 'signin' ? signInForm.email : signUpForm.email}
                            onChange={(event) => {
                              if (activeTab === 'signin') {
                                updateSignInField('email', event.target.value);
                              } else {
                                updateSignUpField('email', event.target.value);
                              }
                            }}
                            placeholder="elias@purehabit.com"
                            type="email"
                          />
                          {(activeTab === 'signin' ? signInForm.fieldErrors.email : signUpForm.fieldErrors.email) && (
                            <p className={`text-xs px-4 ${isDarkMode ? 'text-[#ffd9d2]' : 'text-[#8C3B2B]'}`}>
                              {activeTab === 'signin' ? signInForm.fieldErrors.email : signUpForm.fieldErrors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center px-4">
                            <label
                              className={`block text-[10px] uppercase tracking-[0.2em] font-medium ${
                                isDarkMode ? 'text-[#A58876]/80' : 'text-[#7c6d66]/80'
                              }`}
                              htmlFor="auth-password"
                            >
                              {activeTab === 'signup' ? 'Master Password' : 'Password'}
                            </label>
                            {activeTab === 'signin' && (
                              <button
                                className="text-[10px] uppercase tracking-widest text-[#C06C5D] hover:underline font-medium"
                                type="button"
                                onClick={handleForgotPassword}
                              >
                                Forgot?
                              </button>
                            )}
                          </div>
                          <input
                            className={`w-full border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-[#C06C5D]/20 shadow-sm transition-all text-sm ${
                              isDarkMode
                                ? 'bg-[#1a1210]/50 text-[#FDF8F3]'
                                : 'bg-white/40 text-[#3a2e2a]'
                            }`}
                            id="auth-password"
                            value={activeTab === 'signin' ? signInForm.password : signUpForm.password}
                            onChange={(event) => {
                              if (activeTab === 'signin') {
                                updateSignInField('password', event.target.value);
                              } else {
                                updateSignUpField('password', event.target.value);
                              }
                            }}
                            placeholder="••••••••••••"
                            type="password"
                          />
                          {(activeTab === 'signin' ? signInForm.fieldErrors.password : signUpForm.fieldErrors.password) && (
                            <p className={`text-xs px-4 ${isDarkMode ? 'text-[#ffd9d2]' : 'text-[#8C3B2B]'}`}>
                              {activeTab === 'signin' ? signInForm.fieldErrors.password : signUpForm.fieldErrors.password}
                            </p>
                          )}
                        </div>

                        {(activeTab === 'signin' ? signInForm.error : signUpForm.error) && (
                          <p className={`text-xs px-4 ${isDarkMode ? 'text-[#ffd9d2]' : 'text-[#8C3B2B]'}`}>
                            {activeTab === 'signin' ? signInForm.error : signUpForm.error}
                          </p>
                        )}

                        {cooldownSeconds > 0 && activeTab === 'signin' && (
                          <p className={`text-xs px-4 ${isDarkMode ? 'text-[#ffd9d2]' : 'text-[#8C3B2B]'}`}>
                            {AUTH_COPY.modalCooldown.replace('{seconds}', String(cooldownSeconds))}
                          </p>
                        )}

                        <div className="pt-6">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-4 bg-[#C06C5D] text-white rounded-full font-bold text-sm tracking-widest uppercase shadow-lg transition-all duration-300 disabled:opacity-60"
                            style={{ boxShadow: '0 8px 24px rgba(192, 108, 93, 0.3)' }}
                            type="submit"
                            disabled={
                              activeTab === 'signin'
                                ? signInForm.isSubmitting || cooldownSeconds > 0
                                : signUpForm.isSubmitting
                            }
                          >
                            {activeTab === 'signup'
                              ? signUpForm.isSubmitting
                                ? 'Creating account...'
                                : 'Create My Sanctuary'
                              : signInForm.isSubmitting
                                ? 'Signing in...'
                                : 'Enter My Sanctuary'}
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  </AnimatePresence>
                </>
              )}

              <footer className="text-center pt-10">
                <p
                  className={`text-[10px] max-w-xs mx-auto leading-relaxed ${
                    isDarkMode ? 'text-[#A58876]/70' : 'text-[#7c6d66]/70'
                  }`}
                >
                  By continuing, you agree to PureHabit's{' '}
                  <a className="underline hover:text-[#C06C5D]" href="#">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a className="underline hover:text-[#C06C5D]" href="#">
                    Mindful Use Policy
                  </a>
                  .
                </p>
              </footer>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
