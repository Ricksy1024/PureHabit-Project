const { onCall } = require('firebase-functions/v2/https');
const { admin, db, auth } = require('./db');
const { withErrorHandling, throwHttpsError } = require('./errors');
const { requireCallableAuth } = require('./authMiddleware');
const {
  generateTOTPSecret,
  verifyTOTPToken,
  encryptTOTPSecret,
  decryptTOTPSecret,
  isEncryptedTOTPSecret,
} = require('../core/auth');
const { deleteUserDataCascade } = require('../core/deletion');
const { computeMerge } = require('../core/sync');
const { getLogicalDay, normalizeTimezone } = require('../core/date');
const { COLLECTIONS, VALIDATORS } = require('../core/models');

function serverTimestamp() {
  if (admin && admin.firestore && admin.firestore.FieldValue && admin.firestore.FieldValue.serverTimestamp) {
    return admin.firestore.FieldValue.serverTimestamp();
  }
  return new Date();
}

function getSecretCryptoOptions(deps = {}) {
  return {
    kmsClient: deps.kmsClient,
    kmsKeyName: deps.kmsKeyName,
    localKey: deps.localEncryptionKey,
  };
}

async function getUserProfile(dbClient, uid) {
  const snapshot = await dbClient.collection(COLLECTIONS.USERS).doc(uid).get();
  if (!snapshot.exists) {
    return {};
  }

  return snapshot.data() || {};
}

function validateSyncLogEntry(entry) {
  if (!entry || typeof entry.habitId !== 'string' || !VALIDATORS.isValidDateString(entry.dateString)) {
    throwHttpsError('invalid-argument', 'Each log must include habitId and dateString (YYYY-MM-DD).');
  }

  if (entry.timestamp && Number.isNaN(new Date(entry.timestamp).getTime())) {
    throwHttpsError('invalid-argument', 'timestamp must be a valid ISO-8601 date string.');
  }
}

async function getOwnedHabitIds(dbClient, uid, habitIds) {
  const owned = new Set();

  await Promise.all(
    [...habitIds].map(async (habitId) => {
      const habitSnapshot = await dbClient.collection(COLLECTIONS.HABITS).doc(habitId).get();
      if (!habitSnapshot.exists) {
        throwHttpsError('not-found', `Habit ${habitId} was not found.`);
      }

      const habit = habitSnapshot.data() || {};
      if (habit.userId !== uid) {
        throwHttpsError('permission-denied', `Habit ${habitId} is not owned by the authenticated user.`);
      }

      owned.add(habitId);
    })
  );

  return owned;
}

async function setupTOTPHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const authClient = deps.auth || auth;
  const { uid, email } = requireCallableAuth(request, { requireTotp: false });

  const userRecord = await authClient.getUser(uid);
  const resolvedEmail = email || userRecord.email;

  const { secret, qrUri } = generateTOTPSecret(resolvedEmail, 'PureHabit');
  const encryptedSecret = await encryptTOTPSecret(secret, getSecretCryptoOptions(deps));

  await dbClient.collection(COLLECTIONS.USERS).doc(uid).set(
    {
      id: uid,
      email: resolvedEmail || null,
      totp: {
        enabled: false,
        secret: encryptedSecret,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    success: true,
    secret,
    qrUri,
  };
}

async function verifyTOTPHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const authClient = deps.auth || auth;
  const { uid } = requireCallableAuth(request, { requireTotp: false });
  const token = request && request.data && request.data.token;

  if (!VALIDATORS.isValidTOTPToken(token)) {
    throwHttpsError('invalid-argument', 'A valid 6-digit token is required.');
  }

  const userRef = dbClient.collection(COLLECTIONS.USERS).doc(uid);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.exists) {
    throwHttpsError('failed-precondition', 'User profile must exist before TOTP verification.');
  }

  const userData = userSnapshot.data() || {};
  const storedSecret = userData.totp && userData.totp.secret;
  if (!storedSecret) {
    throwHttpsError('failed-precondition', 'TOTP setup must be completed first.');
  }

  const secret = await decryptTOTPSecret(storedSecret, getSecretCryptoOptions(deps));
  if (!secret) {
    throwHttpsError('failed-precondition', 'TOTP setup must be completed first.');
  }

  const valid = verifyTOTPToken(token, secret);

  if (valid) {
    const persistedSecret = isEncryptedTOTPSecret(storedSecret)
      ? storedSecret
      : await encryptTOTPSecret(secret, getSecretCryptoOptions(deps));

    await userRef.set(
      {
        totp: {
          enabled: true,
          secret: persistedSecret,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const authRecord = await authClient.getUser(uid);
    const existingClaims = authRecord.customClaims || {};
    await authClient.setCustomUserClaims(uid, {
      ...existingClaims,
      totpVerified: true,
    });
  }

  return {
    success: true,
    valid,
  };
}

async function deleteAccountActionHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const authClient = deps.auth || auth;
  const { uid } = requireCallableAuth(request);

  await deleteUserDataCascade(uid, {
    db: dbClient,
    auth: authClient,
  });

  return {
    success: true,
    message: 'Account scheduled for deletion or instantly deleted.',
  };
}

async function syncHabitLogsHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const { uid, token } = requireCallableAuth(request);
  const logs = request && request.data && request.data.logs;

  if (!Array.isArray(logs)) {
    throwHttpsError('invalid-argument', 'logs must be an array.');
  }

  const userProfile = await getUserProfile(dbClient, uid);
  const timezone = normalizeTimezone(userProfile.timezone, normalizeTimezone(token.timezone, 'UTC'));
  const habitIds = new Set();

  logs.forEach((entry) => {
    validateSyncLogEntry(entry);
    habitIds.add(entry.habitId);
  });

  const ownedHabitIds = await getOwnedHabitIds(dbClient, uid, habitIds);
  let processedCount = 0;

  for (const entry of logs) {
    if (!ownedHabitIds.has(entry.habitId)) {
      throwHttpsError('permission-denied', `Habit ${entry.habitId} is not owned by the authenticated user.`);
    }

    const sourceIso =
      typeof entry.timestamp === 'string'
        ? entry.timestamp
        : `${entry.dateString}T12:00:00.000Z`;
    const logicalDay = getLogicalDay(sourceIso, timezone);
    const documentId = `${uid}_${entry.habitId}_${logicalDay}`;
    const reference = dbClient.collection(COLLECTIONS.HABIT_LOGS).doc(documentId);

    await dbClient.runTransaction(async (transaction) => {
      const currentDoc = await transaction.get(reference);
      const merged = computeMerge(
        {
          habitId: entry.habitId,
          userId: uid,
          dateString: logicalDay,
          completed: Boolean(entry.completed),
          timestamp: entry.timestamp || new Date().toISOString(),
        },
        currentDoc.exists ? currentDoc.data() : {}
      );

      transaction.set(reference, merged, { merge: true });
    });

    processedCount += 1;
  }

  return {
    success: true,
    processedCount,
  };
}

const setupTOTP = onCall(withErrorHandling((request) => setupTOTPHandler(request)));
const verifyTOTP = onCall(withErrorHandling((request) => verifyTOTPHandler(request)));
const deleteAccountAction = onCall(
  withErrorHandling((request) => deleteAccountActionHandler(request))
);
const syncHabitLogs = onCall(withErrorHandling((request) => syncHabitLogsHandler(request)));

module.exports = {
  setupTOTP,
  verifyTOTP,
  deleteAccountAction,
  syncHabitLogs,
  setupTOTPHandler,
  verifyTOTPHandler,
  deleteAccountActionHandler,
  syncHabitLogsHandler,
};
