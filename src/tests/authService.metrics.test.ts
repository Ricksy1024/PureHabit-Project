import { FirebaseError } from 'firebase/app';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => {
  return {
    auth: {
      currentUser: null as unknown,
    },
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    sendEmailVerification: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    onIdTokenChanged: vi.fn(),
    getDoc: vi.fn(),
    doc: vi.fn(),
    httpsCallable: vi.fn(),
    callableInvoke: vi.fn(),
  };
});

vi.mock('../config/firebase', () => {
  return {
    auth: hoisted.auth,
    db: {},
    functions: {},
    isFirebaseConfigured: true,
  };
});

vi.mock('firebase/auth', () => {
  return {
    signInWithEmailAndPassword: hoisted.signInWithEmailAndPassword,
    createUserWithEmailAndPassword: hoisted.createUserWithEmailAndPassword,
    sendEmailVerification: hoisted.sendEmailVerification,
    sendPasswordResetEmail: hoisted.sendPasswordResetEmail,
    signOut: hoisted.signOut,
    updateProfile: hoisted.updateProfile,
    onIdTokenChanged: hoisted.onIdTokenChanged,
  };
});

vi.mock('firebase/firestore', () => {
  return {
    getDoc: hoisted.getDoc,
    doc: hoisted.doc,
  };
});

vi.mock('firebase/functions', () => {
  return {
    httpsCallable: hoisted.httpsCallable,
  };
});

function createMockUser() {
  return {
    uid: 'user-1',
    emailVerified: true,
    getIdTokenResult: vi.fn().mockResolvedValue({
      claims: {
        totpVerified: true,
      },
    }),
    reload: vi.fn().mockResolvedValue(undefined),
  };
}

describe('auth service verification metrics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useRealTimers();

    hoisted.signInWithEmailAndPassword.mockReset();
    hoisted.createUserWithEmailAndPassword.mockReset();
    hoisted.sendEmailVerification.mockReset();
    hoisted.sendPasswordResetEmail.mockReset();
    hoisted.signOut.mockReset();
    hoisted.updateProfile.mockReset();
    hoisted.onIdTokenChanged.mockReset();
    hoisted.getDoc.mockReset();
    hoisted.doc.mockReset();
    hoisted.httpsCallable.mockReset();
    hoisted.callableInvoke.mockReset();

    hoisted.httpsCallable.mockReturnValue(hoisted.callableInvoke);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('SC-001 benchmark: >=95% of 20 valid sign-ins finish under 60s', async () => {
    const mockUser = createMockUser();
    hoisted.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    const authService = await import('../services/authService');

    const durations: number[] = [];

    for (let i = 0; i < 20; i += 1) {
      const start = performance.now();
      const result = await authService.signInWithEmail({
        email: `user${i}@purehabit.dev`,
        password: 'valid-password',
      });
      durations.push(performance.now() - start);
      expect(result.ok).toBe(true);
    }

    const withinThreshold = durations.filter((value) => value < 60000).length;
    expect(withinThreshold / 20).toBeGreaterThanOrEqual(0.95);
  });

  it('SC-002 benchmark: >=95% of 20 valid registrations succeed on first attempt', async () => {
    hoisted.createUserWithEmailAndPassword.mockImplementation(async (_auth, email: string) => {
      return {
        user: {
          uid: `uid-${email}`,
          emailVerified: false,
          getIdTokenResult: vi.fn().mockResolvedValue({
            claims: {
              totpVerified: false,
            },
          }),
          reload: vi.fn().mockResolvedValue(undefined),
        },
      };
    });
    hoisted.updateProfile.mockResolvedValue(undefined);
    hoisted.sendEmailVerification.mockResolvedValue(undefined);

    const authService = await import('../services/authService');

    let successful = 0;

    for (let i = 0; i < 20; i += 1) {
      const result = await authService.signUpWithEmail({
        displayName: `User ${i}`,
        email: `new-user-${i}@purehabit.dev`,
        password: 'first-attempt-password',
      });

      if (result.ok) {
        successful += 1;
      }
    }

    expect(successful / 20).toBeGreaterThanOrEqual(0.95);
    expect(hoisted.sendEmailVerification).toHaveBeenCalledTimes(20);
  });

  it('SC-003 failure matrix: 30 failure events return actionable error messages', async () => {
    const authService = await import('../services/authService');

    const failureResults = [] as Array<Awaited<ReturnType<typeof authService.signInWithEmail>> | Awaited<ReturnType<typeof authService.signUpWithEmail>> | Awaited<ReturnType<typeof authService.requestPasswordReset>>>;

    // 10 validation failures (sign in)
    for (let i = 0; i < 10; i += 1) {
      const result = await authService.signInWithEmail({
        email: 'invalid-email',
        password: '',
      });
      failureResults.push(result);
    }

    // 10 auth rejection failures (register conflict)
    hoisted.createUserWithEmailAndPassword.mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'already exists'),
    );
    for (let i = 0; i < 10; i += 1) {
      const result = await authService.signUpWithEmail({
        displayName: 'Existing User',
        email: 'existing@purehabit.dev',
        password: 'valid-password',
      });
      failureResults.push(result);
    }

    // 10 network failures (forgot password)
    hoisted.sendPasswordResetEmail.mockRejectedValue(
      new FirebaseError('auth/network-request-failed', 'offline'),
    );
    for (let i = 0; i < 10; i += 1) {
      const result = await authService.requestPasswordReset('user@purehabit.dev');
      failureResults.push(result);
    }

    expect(failureResults).toHaveLength(30);
    expect(failureResults.every((result) => result.ok === false)).toBe(true);
    expect(
      failureResults.every(
        (result) => typeof result.error === 'string' && result.error.trim().length > 0,
      ),
    ).toBe(true);
  });

  it('SC-008 cooldown: 20 sessions trigger 5 failures then enforce disabled submit', async () => {
    vi.useFakeTimers();
    const authService = await import('../services/authService');

    hoisted.signInWithEmailAndPassword.mockRejectedValue(
      new FirebaseError('auth/wrong-password', 'wrong password'),
    );

    const base = new Date('2026-04-10T00:00:00.000Z').getTime();
    let enforcedSessions = 0;

    for (let session = 0; session < 20; session += 1) {
      vi.setSystemTime(new Date(base + session * 16 * 60 * 1000));

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const result = await authService.signInWithEmail({
          email: `session-${session}@purehabit.dev`,
          password: 'bad-password',
        });
        expect(result.ok).toBe(false);
      }

      const blockedResult = await authService.signInWithEmail({
        email: `session-${session}@purehabit.dev`,
        password: 'bad-password',
      });

      if (
        blockedResult.ok === false &&
        blockedResult.errorCode === 'client/cooldown'
      ) {
        enforcedSessions += 1;
      }
    }

    expect(enforcedSessions).toBe(20);
  });
});
