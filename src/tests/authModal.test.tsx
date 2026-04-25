import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthModal } from '../components/AuthModal';

const authContextRef = {
  value: {
    authState: {
      status: 'authenticated_ready',
      message: null,
      user: {
        uid: 'user-1',
      },
      security: {
        emailVerified: true,
        totpVerified: false,
        isReady: true,
        missingSteps: [],
      },
      profile: {
        id: 'user-1',
        email: 'user@example.com',
        timezone: 'UTC',
        totp: {
          enabled: true,
        },
      },
      profileStatus: 'ready',
    },
    cooldownState: {
      attempts: 0,
      windowStart: Date.now(),
      cooldownUntil: null,
    },
    signIn: vi.fn(),
    signUp: vi.fn(),
    sendPasswordReset: vi.fn(),
    sendEmailVerification: vi.fn(),
    setupTotp: vi.fn(),
    verifyTotp: vi.fn(),
    refreshAuthState: vi.fn(),
  },
};

vi.mock('../hooks/useAuth', () => {
  return {
    useAuth: () => authContextRef.value,
  };
});

describe('AuthModal TOTP recovery', () => {
  beforeEach(() => {
    authContextRef.value.verifyTotp.mockReset();
    authContextRef.value.refreshAuthState.mockReset();
  });

  it('keeps the modal open and prompts for a verification code when TOTP is already configured', () => {
    const onClose = vi.fn();

    render(<AuthModal isOpen onClose={onClose} isDarkMode={false} mode="totp" />);

    expect(screen.getByText('Unlock protected settings')).toBeInTheDocument();
    expect(screen.getByText('Authenticator confirmation')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This part of Settings is protected. Enter a fresh 6-digit authenticator code to continue.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter 6-digit authenticator code'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Start TOTP setup')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
