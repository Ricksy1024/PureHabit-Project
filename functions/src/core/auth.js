/**
 * auth.js — TOTP generation and verification pure functions.
 */

const crypto = require('crypto');
const { TOTP_CONFIG, VALIDATORS } = require('./models');

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer) {
  let bits = '';
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0');
  }

  let output = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    output += BASE32_CHARS[parseInt(chunk, 2)];
  }

  return output;
}

function base32Decode(value) {
  let bits = '';
  for (const char of value.replace(/=+$/, '')) {
    const index = BASE32_CHARS.indexOf(char.toUpperCase());
    if (index === -1) {
      throw new Error('Invalid base32 secret');
    }
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

function generateTOTP(secret, timeMs) {
  const step = TOTP_CONFIG.PERIOD;
  const counter = Math.floor((timeMs || Date.now()) / 1000 / step);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter & 0xffffffff, 4);

  const key = base32Decode(secret);
  const hmac = crypto.createHmac(TOTP_CONFIG.ALGORITHM, key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      (hmac[offset + 1] << 16) |
      (hmac[offset + 2] << 8) |
      hmac[offset + 3]) %
    10 ** TOTP_CONFIG.DIGITS;

  return code.toString().padStart(TOTP_CONFIG.DIGITS, '0');
}

function buildFallbackAuthenticator() {
  return {
    generateSecret: () => base32Encode(crypto.randomBytes(20)),
    keyuri: (email, appName, secret) => {
      const label = encodeURIComponent(`${appName}:${email}`);
      return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
    },
    check: (token, secret) => {
      for (const windowOffset of [-1, 0, 1]) {
        const candidate = generateTOTP(secret, Date.now() + windowOffset * TOTP_CONFIG.PERIOD * 1000);
        if (candidate === token) {
          return true;
        }
      }
      return false;
    },
  };
}

function getAuthenticator() {
  try {
    const { authenticator } = require('otplib');
    authenticator.options = {
      digits: TOTP_CONFIG.DIGITS,
      step: TOTP_CONFIG.PERIOD,
      algorithm: TOTP_CONFIG.ALGORITHM,
      window: 1,
    };
    return authenticator;
  } catch (_error) {
    return buildFallbackAuthenticator();
  }
}

function generateTOTPSecret(email, appName = 'PureHabit') {
  const authenticator = getAuthenticator();
  const safeEmail = typeof email === 'string' && email ? email : 'user@purehabit.local';
  const safeAppName = typeof appName === 'string' && appName ? appName : 'PureHabit';

  const secret = authenticator.generateSecret();
  const qrUri = authenticator.keyuri(safeEmail, safeAppName, secret);

  return { secret, qrUri };
}

function verifyTOTPToken(token, secret) {
  const authenticator = getAuthenticator();
  if (!VALIDATORS.isValidTOTPToken(token) || typeof secret !== 'string' || !secret) {
    return false;
  }

  try {
    return authenticator.check(token, secret);
  } catch (_error) {
    return false;
  }
}

module.exports = {
  generateTOTPSecret,
  verifyTOTPToken,
};
