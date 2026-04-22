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

function cloneValue(value) {
  if (value === null || value === undefined) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

function createDbMock(seed = {}) {
  const store = {
    users: new Map(Object.entries(seed.users || {})),
    habits: new Map(Object.entries(seed.habits || {})),
    habit_logs: new Map(Object.entries(seed.habit_logs || {})),
  };

  function getCollectionMap(collectionName) {
    if (!store[collectionName]) {
      store[collectionName] = new Map();
    }
    return store[collectionName];
  }

  function createDocRef(collectionName, id) {
    const collectionMap = getCollectionMap(collectionName);

    return {
      id,
      _collectionName: collectionName,
      get: jest.fn(async () => ({
        exists: collectionMap.has(id),
        data: () => cloneValue(collectionMap.get(id)),
      })),
      set: jest.fn(async (payload, options = {}) => {
        if (options.merge && collectionMap.has(id)) {
          collectionMap.set(id, {
            ...cloneValue(collectionMap.get(id)),
            ...cloneValue(payload),
          });
          return;
        }

        collectionMap.set(id, cloneValue(payload));
      }),
    };
  }

  let transactionQueue = Promise.resolve();
  const db = {
    _store: store,
    collection: jest.fn((collectionName) => ({
      doc: jest.fn((id) => createDocRef(collectionName, id)),
    })),
    runTransaction: jest.fn(async (callback) => {
      const run = transactionQueue.then(async () => {
        const writes = [];
        const transaction = {
          get: jest.fn(async (ref) => ref.get()),
          set: jest.fn((ref, payload, options) => {
            writes.push({ ref, payload, options });
          }),
        };

        const result = await callback(transaction);
        await Promise.all(writes.map((write) => write.ref.set(write.payload, write.options)));
        return result;
      });

      transactionQueue = run.catch(() => {});
      return run;
    }),
  };

  return db;
}

describe('API handlers', () => {
  test('setupTOTPHandler stores encrypted secret and returns setup payload', async () => {
    const db = createDbMock();

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

    const result = await setupTOTPHandler(request, {
      db,
      auth,
      localEncryptionKey: 'test-local-key',
    });

    expect(result.success).toBe(true);
    expect(result.secret).toMatch(/^[A-Z2-7]+=*$/);
    expect(result.qrUri).toMatch(/^otpauth:\/\/totp\//);

    const savedUser = db._store.users.get('user-1');
    expect(savedUser.totp.secret.startsWith('local:')).toBe(true);
  });

  test('verifyTOTPHandler validates token, migrates plaintext secret, and merges claims', async () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const db = createDbMock({
      users: {
        'user-1': {
          totp: { secret },
        },
      },
    });

    const auth = {
      getUser: jest.fn().mockResolvedValue({ customClaims: { role: 'admin' } }),
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

    const result = await verifyTOTPHandler(request, {
      db,
      auth,
      localEncryptionKey: 'test-local-key',
    });

    expect(result).toEqual({ success: true, valid: true });

    const savedUser = db._store.users.get('user-1');
    expect(savedUser.totp.enabled).toBe(true);
    expect(savedUser.totp.secret.startsWith('local:')).toBe(true);
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith('user-1', {
      role: 'admin',
      totpVerified: true,
    });
  });

  test('syncHabitLogsHandler uses user profile timezone and writes with transactional merge', async () => {
    const db = createDbMock({
      users: {
        'user-1': { timezone: 'America/Los_Angeles' },
      },
      habits: {
        'habit-1': { userId: 'user-1' },
      },
    });

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
            timestamp: '2026-04-09T07:30:00.000Z',
          },
        ],
      },
    };

    const result = await syncHabitLogsHandler(request, { db });

    expect(result).toEqual({ success: true, processedCount: 1 });

    const saved = db._store.habit_logs.get('user-1_habit-1_2026-04-08');
    expect(saved.completed).toBe(true);
    expect(saved.dateString).toBe('2026-04-08');
    expect(db.runTransaction).toHaveBeenCalledTimes(1);
  });

  test('syncHabitLogsHandler rejects habit IDs not owned by caller', async () => {
    const db = createDbMock({
      users: {
        'user-1': { timezone: 'UTC' },
      },
      habits: {
        'habit-1': { userId: 'user-2' },
      },
    });

    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
          totpVerified: true,
        },
      },
      data: {
        logs: [
          {
            habitId: 'habit-1',
            dateString: '2026-04-09',
            completed: true,
            timestamp: '2026-04-09T10:00:00.000Z',
          },
        ],
      },
    };

    await expect(syncHabitLogsHandler(request, { db })).rejects.toMatchObject({
      code: 'permission-denied',
    });
  });

  test('syncHabitLogsHandler preserves completed=true under concurrent conflicting writes', async () => {
    const db = createDbMock({
      users: {
        'user-1': { timezone: 'UTC' },
      },
      habits: {
        'habit-1': { userId: 'user-1' },
      },
    });

    const baseAuth = {
      uid: 'user-1',
      token: {
        email_verified: true,
        totpVerified: true,
      },
    };

    const requestTrue = {
      auth: baseAuth,
      data: {
        logs: [
          {
            habitId: 'habit-1',
            dateString: '2026-04-09',
            completed: true,
            timestamp: '2026-04-09T09:00:00.000Z',
          },
        ],
      },
    };

    const requestFalse = {
      auth: baseAuth,
      data: {
        logs: [
          {
            habitId: 'habit-1',
            dateString: '2026-04-09',
            completed: false,
            timestamp: '2026-04-09T10:00:00.000Z',
          },
        ],
      },
    };

    await Promise.all([
      syncHabitLogsHandler(requestFalse, { db }),
      syncHabitLogsHandler(requestTrue, { db }),
    ]);

    const saved = db._store.habit_logs.get('user-1_habit-1_2026-04-09');
    expect(saved.completed).toBe(true);
    expect(db.runTransaction).toHaveBeenCalledTimes(2);
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

  test('syncHabitLogsHandler rejects non-boolean completed values', async () => {
    const db = createDbMock({
      users: {
        'user-1': { timezone: 'UTC' },
      },
      habits: {
        'habit-1': { userId: 'user-1' },
      },
    });

    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
          totpVerified: true,
        },
      },
      data: {
        logs: [
          {
            habitId: 'habit-1',
            dateString: '2026-04-09',
            completed: 'false',
            timestamp: '2026-04-09T10:00:00.000Z',
          },
        ],
      },
    };

    await expect(syncHabitLogsHandler(request, { db })).rejects.toMatchObject({
      code: 'invalid-argument',
    });
  });

  test('syncHabitLogsHandler rejects impossible calendar dates', async () => {
    const db = createDbMock({
      users: {
        'user-1': { timezone: 'UTC' },
      },
      habits: {
        'habit-1': { userId: 'user-1' },
      },
    });

    const request = {
      auth: {
        uid: 'user-1',
        token: {
          email_verified: true,
          totpVerified: true,
        },
      },
      data: {
        logs: [
          {
            habitId: 'habit-1',
            dateString: '2026-02-30',
            completed: true,
          },
        ],
      },
    };

    await expect(syncHabitLogsHandler(request, { db })).rejects.toMatchObject({
      code: 'invalid-argument',
    });
  });
});
