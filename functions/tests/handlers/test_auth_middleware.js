const { requireCallableAuth } = require('../../src/handlers/authMiddleware');

describe('requireCallableAuth (US1)', () => {
  test('throws unauthenticated when auth context is missing', () => {
    expect(() => requireCallableAuth({})).toThrow();
    try {
      requireCallableAuth({});
    } catch (error) {
      expect(error.code).toBe('unauthenticated');
    }
  });

  test('throws when email is not verified', () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: false,
          totpVerified: true,
        },
      },
    };

    expect(() => requireCallableAuth(request)).toThrow();
    try {
      requireCallableAuth(request);
    } catch (error) {
      expect(error.code).toBe('failed-precondition');
    }
  });

  test('throws when totp claim is missing', () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
        },
      },
    };

    expect(() => requireCallableAuth(request)).toThrow();
    try {
      requireCallableAuth(request);
    } catch (error) {
      expect(error.code).toBe('permission-denied');
    }
  });

  test('throws when only generic mfa claim is present without totpVerified', () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
          mfaVerified: true,
        },
      },
    };

    expect(() => requireCallableAuth(request)).toThrow();
    try {
      requireCallableAuth(request);
    } catch (error) {
      expect(error.code).toBe('permission-denied');
    }
  });

  test('returns auth payload when requirements are met', () => {
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

    const result = requireCallableAuth(request);

    expect(result.uid).toBe('user-1');
    expect(result.email).toBe('user@example.com');
  });
});
