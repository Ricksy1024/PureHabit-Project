const crypto = require('crypto');
const {
  setupTOTPHandler,
  verifyTOTPHandler,
  syncHabitLogsHandler,
} = require('../../src/handlers/api');

function base32Decode(encoded) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of encoded.replace(/=+$/, '')) {
    const val = charset.indexOf(c.toUpperCase());
    if (val === -1) {
      throw new Error('Invalid base32 char: ' + c);
    }
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateToken(secret, timeMs) {
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

describe('API handlers', () => {
  test('setupTOTPHandler stores generated secret and URI', async () => {
    const set = jest.fn().mockResolvedValue(undefined);
    const db = {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set,
        })),
      })),
    };

    const auth = {
      getUser: jest.fn().mockResolvedValue({ email: 'user@example.com' }),
    };

    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
        },
      },
      data: {},
    };

    const result = await setupTOTPHandler(request, { db, auth });

    expect(result.success).toBe(true);
    expect(result.secret).toMatch(/^[A-Z2-7]+=*$/);
    expect(result.qrUri).toMatch(/^otpauth:\/\/totp\//);
    expect(set).toHaveBeenCalledTimes(1);
  });

  test('verifyTOTPHandler validates token and sets custom claim', async () => {
    const set = jest.fn().mockResolvedValue(undefined);
    const secret = 'JBSWY3DPEHPK3PXP';

    const db = {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              totp: { secret },
            }),
          }),
          set,
        })),
      })),
    };

    const auth = {
      setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
    };

    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
        },
      },
      data: {
        token: generateToken(secret),
      },
    };

    const result = await verifyTOTPHandler(request, { db, auth });

    expect(result).toEqual({ success: true, valid: true });
    expect(set).toHaveBeenCalledTimes(1);
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith('user-1', { totpVerified: true });
  });

  test('syncHabitLogsHandler processes historical payload and applies logical day', async () => {
    const writes = [];
    const docs = new Map();

    const db = {
      batch: jest.fn(() => ({
        set: jest.fn((ref, data) => {
          writes.push({ id: ref.id, data });
          docs.set(ref.id, data);
        }),
        commit: jest.fn().mockResolvedValue(undefined),
      })),
      collection: jest.fn(() => ({
        doc: jest.fn((id) => ({
          id,
          get: jest.fn().mockResolvedValue({
            exists: docs.has(id),
            data: () => docs.get(id),
          }),
        })),
      })),
    };

    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
          totpVerified: true,
          timezone: 'UTC',
        },
      },
      data: {
        logs: [
          {
            habitId: 'habit-1',
            dateString: '2026-04-09',
            completed: true,
            timestamp: '2026-04-09T01:15:00.000Z',
          },
        ],
      },
    };

    const result = await syncHabitLogsHandler(request, { db });

    expect(result).toEqual({ success: true, processedCount: 1 });
    expect(writes).toHaveLength(1);
    expect(writes[0].id).toBe('user-1_habit-1_2026-04-08');
    expect(writes[0].data.completed).toBe(true);
    expect(writes[0].data.dateString).toBe('2026-04-08');
  });

  test('syncHabitLogsHandler blocks requests without totp verification', async () => {
    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
        },
      },
      data: { logs: [] },
    };

    await expect(syncHabitLogsHandler(request, { db: {} })).rejects.toMatchObject({
      code: 'permission-denied',
    });
  });
});
