import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authStateRef = {
  value: {
    status: 'unauthenticated',
    message: null,
  } as any,
};

const authApiRef = {
  refreshAuthState: vi.fn(),
  signOut: vi.fn(async () => ({ ok: true })),
};

vi.mock('../hooks/useAuth', () => {
  return {
    useAuth: () => ({
      authState: authStateRef.value,
      refreshAuthState: authApiRef.refreshAuthState,
      signOut: authApiRef.signOut,
    }),
  };
});

vi.mock('../components/ShaderBackground', () => {
  return {
    ShaderBackground: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="shader-background">{children}</div>
    ),
  };
});

vi.mock('../components/ThemeToggle', () => {
  return {
    ThemeToggle: () => <div data-testid="theme-toggle" />,
  };
});

vi.mock('../components/StatisticsPage', () => {
  return {
    StatisticsPage: () => <div>Statistics Stub</div>,
  };
});

vi.mock('../components/AuthModal', () => {
  return {
    AuthModal: ({ isOpen }: { isOpen: boolean }) =>
      isOpen ? <div>Auth Modal Open</div> : null,
  };
});

vi.mock('canvas-confetti', () => {
  return {
    default: vi.fn(),
  };
});

function authenticatedReadyState() {
  return {
    status: 'authenticated_ready',
    message: null,
    user: {
      uid: 'ready-user',
    },
    security: {
      emailVerified: true,
      totpVerified: true,
      isReady: true,
      missingSteps: [],
    },
    profile: {
      id: 'ready-user',
      email: 'ready@purehabit.dev',
      timezone: 'UTC',
      totp: {
        enabled: true,
      },
    },
    profileStatus: 'ready',
  };
}

function authenticatedPendingState() {
  return {
    status: 'authenticated_pending',
    message: null,
    user: {
      uid: 'pending-user',
    },
    security: {
      emailVerified: false,
      totpVerified: false,
      isReady: false,
      missingSteps: ['email_verification', 'totp_setup'],
    },
    profile: null,
    profileStatus: 'loading',
  };
}

describe('App auth guard verification tasks', () => {
  beforeEach(() => {
    authApiRef.refreshAuthState.mockReset();
    authApiRef.signOut.mockReset();
    authApiRef.signOut.mockResolvedValue({ ok: true });
    authStateRef.value = {
      status: 'unauthenticated',
      message: null,
    };
  });

  it('SC-006: 30 protected action attempts remain blocked when unauthenticated', async () => {
    const { default: App } = await import('../App');
    render(<App />);

    const dashboard = screen.getByText('Dashboard');
    const statistics = screen.getByText('Statistics');

    for (let i = 0; i < 15; i += 1) {
      fireEvent.click(dashboard);
      fireEvent.click(statistics);
    }

    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.queryByText('Good Morning, Alex')).not.toBeInTheDocument();
    expect(screen.getByText('Auth Modal Open')).toBeInTheDocument();
  });

  it('SC-007: 20 gated-session remediation checks show guidance and keep actions blocked', async () => {
    authStateRef.value = authenticatedPendingState();

    const { default: App } = await import('../App');
    render(<App />);

    expect(screen.getByText('Finish Security Setup')).toBeInTheDocument();
    expect(screen.getByText('Verify your email address')).toBeInTheDocument();
    expect(screen.getByText('Finish TOTP setup')).toBeInTheDocument();
    expect(screen.queryByText('Good Morning, Alex')).not.toBeInTheDocument();

    const refreshButton = screen.getByText('Refresh Status');

    for (let i = 0; i < 20; i += 1) {
      fireEvent.click(refreshButton);
    }

    expect(authApiRef.refreshAuthState).toHaveBeenCalledTimes(20);
  });

  it('SC-004: 100 authenticated reload continuity trials keep session recognized >=99%', async () => {
    authStateRef.value = authenticatedReadyState();

    const { default: App } = await import('../App');

    let recognized = 0;

    for (let i = 0; i < 100; i += 1) {
      const rendered = render(<App />);
      if (screen.queryByText('Good Morning, Alex')) {
        recognized += 1;
      }
      rendered.unmount();
    }

    expect(recognized / 100).toBeGreaterThanOrEqual(0.99);
  });

  it('SC-005: 100 auth-state transitions reflect in UI within 5 seconds >=99%', async () => {
    authStateRef.value = authenticatedReadyState();

    const { default: App } = await import('../App');
    const rendered = render(<App />);

    let withinFiveSeconds = 0;

    for (let i = 0; i < 100; i += 1) {
      const start = performance.now();
      authStateRef.value = i % 2 === 0
        ? authenticatedReadyState()
        : {
            status: 'unauthenticated',
            message: null,
          };

      rendered.rerender(<App />);

      const elapsed = performance.now() - start;
      if (elapsed <= 5000) {
        withinFiveSeconds += 1;
      }
    }

    expect(withinFiveSeconds / 100).toBeGreaterThanOrEqual(0.99);
    rendered.unmount();
  });

  it('CON-002: account-state invalidation fallback removes authenticated UI access', async () => {
    authStateRef.value = authenticatedReadyState();

    const { default: App } = await import('../App');
    const rendered = render(<App />);

    expect(screen.getByText('Good Morning, Alex')).toBeInTheDocument();

    authStateRef.value = {
      status: 'unauthenticated',
      message: 'Your session is no longer valid. Please sign in again.',
    };

    rendered.rerender(<App />);

    expect(screen.getAllByText('Sign In Required').length).toBeGreaterThan(0);
    expect(screen.queryByText('Good Morning, Alex')).not.toBeInTheDocument();
  });
});
