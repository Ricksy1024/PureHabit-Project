/**
 * auth.js — TOTP generation and verification pure functions.
 */

const crypto = require('crypto');
const { TOTP_CONFIG, VALIDATORS } = require('./models');

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const KMS_SECRET_PREFIX = 'kms:';
const LOCAL_SECRET_PREFIX = 'local:';
const DEV_FALLBACK_LOCAL_KEY = 'purehabit-dev-local-key';

let cachedKmsClient = null;

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

function getKmsClient(options = {}) {
  if (options.kmsClient) {
    return options.kmsClient;
  }

  if (cachedKmsClient) {
    return cachedKmsClient;
  }

  try {
    const { KeyManagementServiceClient } = require('@google-cloud/kms');
    cachedKmsClient = new KeyManagementServiceClient();
    return cachedKmsClient;
  } catch (_error) {
    return null;
  }
}

function resolveKmsKeyName(options = {}) {
  if (typeof options.kmsKeyName === 'string' && options.kmsKeyName) {
    return options.kmsKeyName;
  }
  return process.env.TOTP_KMS_KEY_NAME || '';
}

function resolveLocalEncryptionKey(options = {}) {
  if (typeof options.localKey === 'string' && options.localKey) {
    return options.localKey;
  }

  if (typeof process.env.TOTP_LOCAL_ENCRYPTION_KEY === 'string' && process.env.TOTP_LOCAL_ENCRYPTION_KEY) {
    return process.env.TOTP_LOCAL_ENCRYPTION_KEY;
  }

  if (process.env.NODE_ENV === 'test') {
    return DEV_FALLBACK_LOCAL_KEY;
  }

  return '';
}

function isEncryptedTOTPSecret(secret) {
  return (
    typeof secret === 'string' &&
    (secret.startsWith(KMS_SECRET_PREFIX) || secret.startsWith(LOCAL_SECRET_PREFIX))
  );
}

function deriveKey(localKey) {
  return crypto.createHash('sha256').update(localKey, 'utf8').digest();
}

function encryptWithLocalKey(secret, localKey) {
  const key = deriveKey(localKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${LOCAL_SECRET_PREFIX}${iv.toString('base64')}.${authTag.toString('base64')}.${ciphertext.toString('base64')}`;
}

function decryptWithLocalKey(payload, localKey) {
  const encoded = payload.slice(LOCAL_SECRET_PREFIX.length);
  const [ivB64, tagB64, ciphertextB64] = encoded.split('.');
  if (!ivB64 || !tagB64 || !ciphertextB64) {
    throw new Error('Invalid local encrypted payload format');
  }

  const key = deriveKey(localKey);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(ivB64, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, 'base64')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}

async function encryptWithKms(secret, keyName, kmsClient) {
  const [response] = await kmsClient.encrypt({
    name: keyName,
    plaintext: Buffer.from(secret, 'utf8'),
  });

  return `${KMS_SECRET_PREFIX}${Buffer.from(response.ciphertext).toString('base64')}`;
}

async function decryptWithKms(payload, keyName, kmsClient) {
  const ciphertext = Buffer.from(payload.slice(KMS_SECRET_PREFIX.length), 'base64');
  const [response] = await kmsClient.decrypt({
    name: keyName,
    ciphertext,
  });

  return Buffer.from(response.plaintext).toString('utf8');
}

async function encryptTOTPSecret(secret, options = {}) {
  if (typeof secret !== 'string' || !secret) {
    throw new Error('A non-empty TOTP secret is required for encryption');
  }

  if (isEncryptedTOTPSecret(secret)) {
    return secret;
  }

  const kmsClient = getKmsClient(options);
  const kmsKeyName = resolveKmsKeyName(options);
  if (kmsClient && kmsKeyName) {
    return encryptWithKms(secret, kmsKeyName, kmsClient);
  }

  const localKey = resolveLocalEncryptionKey(options);
  if (!localKey) {
    throw new Error('TOTP encryption is not configured. Set TOTP_KMS_KEY_NAME or TOTP_LOCAL_ENCRYPTION_KEY.');
  }

  return encryptWithLocalKey(secret, localKey);
}

async function decryptTOTPSecret(secret, options = {}) {
  if (typeof secret !== 'string' || !secret) {
    return null;
  }

  if (secret.startsWith(KMS_SECRET_PREFIX)) {
    const kmsClient = getKmsClient(options);
    const kmsKeyName = resolveKmsKeyName(options);
    if (!kmsClient || !kmsKeyName) {
      throw new Error('KMS secret detected but KMS client/key is not configured');
    }
    return decryptWithKms(secret, kmsKeyName, kmsClient);
  }

  if (secret.startsWith(LOCAL_SECRET_PREFIX)) {
    const localKey = resolveLocalEncryptionKey(options);
    if (!localKey) {
      throw new Error('Local encrypted secret detected but local key is missing');
    }
    return decryptWithLocalKey(secret, localKey);
  }

  // Plaintext fallback for migration; callers should re-encrypt after successful verification.
  return secret;
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
  encryptTOTPSecret,
  decryptTOTPSecret,
  isEncryptedTOTPSecret,
};
