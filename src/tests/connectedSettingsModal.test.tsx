import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConnectedSettingsModal } from '../components/ConnectedSettingsModal';

vi.mock('../services/habitService', () => {
  return {
    listenForForegroundMessages: () => () => undefined,
    registerPushToken: vi.fn(),
    updateUserProfile: vi.fn(),
  };
});

vi.mock('../services/authService', () => {
  return {
    deleteAccountAction: vi.fn(),
    deleteUserDataAction: vi.fn(),
  };
});

describe('ConnectedSettingsModal protected controls', () => {
  it('shows TOTP-gated profile and privacy sections while exposing the placeholder 2FA tab', () => {
    render(
      <ConnectedSettingsModal
        isOpen
        onClose={vi.fn()}
        isDarkMode={false}
        setIsDarkMode={vi.fn()}
        isAuthenticated
        onAuthAction={vi.fn()}
        onOpenAuthModal={vi.fn()}
        authState={{
          status: 'authenticated_ready',
          message: null,
          user: {
            uid: 'user-1',
            email: 'user@example.com',
            displayName: 'User',
          } as never,
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
              enabled: false,
            },
          },
          profileStatus: 'ready',
        }}
        refreshAuthState={vi.fn(async () => undefined)}
        signOut={vi.fn(async () => ({ ok: true }))}
      />,
    );

    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Two-Factor Auth')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Profile changes are protected. Verify your authenticator before saving user data.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Profile' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Privacy' }));
    expect(screen.getByText('Sensitive privacy controls')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unlock Privacy Controls' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Two-Factor Auth' }));
    expect(screen.getByText('Placeholder')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Two-factor management is coming soon. For now, the app will ask for TOTP only when you try to change user data or open protected privacy controls.',
      ),
    ).toBeInTheDocument();
  });
});
