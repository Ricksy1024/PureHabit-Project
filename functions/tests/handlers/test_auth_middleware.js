const { requireCallableAuth } = require('../../src/handlers/authMiddleware');

describe('requireCallableAuth (US1)', () => {
  test('throws unauthenticated when auth context is missing', async () => {
    await expect(requireCallableAuth({})).rejects.toMatchObject({
      code: 'unauthenticated',
    });
  });

  test('throws when email is not verified', async () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: false,
          totpVerified: true,
        },
      },
    };

    const auth = {
      getUser: jest.fn().mockResolvedValue({
        emailVerified: false,
        customClaims: { totpVerified: true },
      }),
    };

    await expect(requireCallableAuth(request, {}, { auth })).rejects.toMatchObject({
      code: 'failed-precondition',
    });
  });

  test('throws when totp claim is missing', async () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
        },
      },
    };

    const auth = {
      getUser: jest.fn().mockResolvedValue({
        emailVerified: true,
        customClaims: {},
      }),
    };

    await expect(requireCallableAuth(request, {}, { auth })).rejects.toMatchObject({
      code: 'permission-denied',
    });
  });

  test('throws when only generic mfa claim is present without totpVerified', async () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
          mfaVerified: true,
        },
      },
    };

    const auth = {
      getUser: jest.fn().mockResolvedValue({
        emailVerified: true,
        customClaims: {},
      }),
    };

    await expect(requireCallableAuth(request, {}, { auth })).rejects.toMatchObject({
      code: 'permission-denied',
    });
  });

  test('accepts stale email_verified token when auth record is verified', async () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email: 'user@example.com',
          email_verified: false,
          totpVerified: true,
        },
      },
    };

    const auth = {
      getUser: jest.fn().mockResolvedValue({
        emailVerified: true,
        customClaims: { totpVerified: true },
      }),
    };

    const result = await requireCallableAuth(request, {}, { auth });

    expect(result.uid).toBe('user-1');
    expect(result.email).toBe('user@example.com');
  });

  test('returns auth payload when requirements are met', async () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email: 'user@example.com',
          email_verified: true,
          totpVerified: true,
        },
      },
    };

    const auth = {
      getUser: jest.fn().mockResolvedValue({
        emailVerified: true,
        customClaims: { totpVerified: true },
      }),
    };

    const result = await requireCallableAuth(request, {}, { auth });

    expect(result.uid).toBe('user-1');
    expect(result.email).toBe('user@example.com');
  });
});
