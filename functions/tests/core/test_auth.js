/**
 * test_auth.js — Integration tests for TOTP generation and verification.
 *
 * T008 [US1]: Tests for verifyTOTP using mocked keys.
 * Written BEFORE implementation (TDD RED phase).
 * Uses Node.js built-in crypto for RFC 6238 reference implementation.
 */

const crypto = require('crypto');

// The module under test — stubs exist, functions are undefined (RED)
const { generateTOTPSecret, verifyTOTPToken } = require('../../src/core/auth');

/**
 * Reference TOTP generator using Node.js crypto (for test verification only).
 * Generates a 6-digit TOTP code from a base32-encoded secret.
 */
function base32Decode(encoded) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of encoded.replace(/=+$/, '')) {
    const val = charset.indexOf(c.toUpperCase());
    if (val === -1) throw new Error('Invalid base32 char: ' + c);
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function referenceGenerateTOTP(secret, timeMs) {
  const epoch = Math.floor((timeMs || Date.now()) / 1000);
  const counter = Math.floor(epoch / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter & 0xffffffff, 4);
  const key = base32Decode(secret);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      (hmac[offset + 1] << 16) |
      (hmac[offset + 2] << 8) |
      hmac[offset + 3]) %
    1000000;
  return code.toString().padStart(6, '0');
}

describe('TOTP Auth Core (US1)', () => {
  describe('generateTOTPSecret', () => {
    test('returns an object with secret and qrUri properties', () => {
      const result = generateTOTPSecret('user@example.com', 'PureHabit');

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrUri');
      expect(typeof result.secret).toBe('string');
      expect(typeof result.qrUri).toBe('string');
    });

    test('generated secret is a valid base32 string', () => {
      const result = generateTOTPSecret('user@example.com', 'PureHabit');

      // base32 charset: A-Z, 2-7, optional trailing =
      expect(result.secret).toMatch(/^[A-Z2-7]+=*$/);
    });

    test('generated secret is at least 20 characters long', () => {
      const result = generateTOTPSecret('user@example.com', 'PureHabit');

      expect(result.secret.length).toBeGreaterThanOrEqual(20);
    });

    test('qrUri follows the otpauth:// format', () => {
      const result = generateTOTPSecret('user@example.com', 'PureHabit');

      expect(result.qrUri).toMatch(/^otpauth:\/\/totp\//);
      expect(result.qrUri).toContain('user%40example.com');
      expect(result.qrUri).toContain('PureHabit');
    });

    test('generates unique secrets each time', () => {
      const r1 = generateTOTPSecret('a@b.com', 'PureHabit');
      const r2 = generateTOTPSecret('a@b.com', 'PureHabit');

      expect(r1.secret).not.toBe(r2.secret);
    });
  });

  describe('verifyTOTPToken', () => {
    // Use a known fixed secret for deterministic testing
    const FIXED_SECRET = 'JBSWY3DPEHPK3PXP'; // well-known test secret

    test('returns true for a valid TOTP token generated from the same secret', () => {
      const now = Date.now();
      const validToken = referenceGenerateTOTP(FIXED_SECRET, now);

      const result = verifyTOTPToken(validToken, FIXED_SECRET);

      expect(result).toBe(true);
    });

    test('returns false for an obviously invalid TOTP token', () => {
      // Generate a valid token, then flip digits to produce an invalid one
      const validToken = referenceGenerateTOTP(FIXED_SECRET);
      const invalidToken = validToken === '000000' ? '111111' : '000000';

      const result = verifyTOTPToken(invalidToken, FIXED_SECRET);

      expect(result).toBe(false);
    });

    test('returns false for a token from a different secret', () => {
      const otherSecret = 'GEZDGNBVGY3TQOJQ'; // different test secret
      const tokenFromOther = referenceGenerateTOTP(otherSecret);

      const result = verifyTOTPToken(tokenFromOther, FIXED_SECRET);

      // Extremely unlikely to match a different secret's output
      expect(result).toBe(false);
    });

    test('returns false for empty token', () => {
      const result = verifyTOTPToken('', FIXED_SECRET);

      expect(result).toBe(false);
    });

    test('returns false for non-6-digit token', () => {
      const result = verifyTOTPToken('12345', FIXED_SECRET);

      expect(result).toBe(false);
    });

    test('returns false for null/undefined token', () => {
      expect(verifyTOTPToken(null, FIXED_SECRET)).toBe(false);
      expect(verifyTOTPToken(undefined, FIXED_SECRET)).toBe(false);
    });
  });
});
