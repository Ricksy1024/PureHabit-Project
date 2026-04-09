const { onCall } = require('firebase-functions/v2/https');
const { admin, db, auth } = require('./db');
const { withErrorHandling, throwHttpsError } = require('./errors');
const { requireCallableAuth } = require('./authMiddleware');
const { generateTOTPSecret, verifyTOTPToken } = require('../core/auth');
const { deleteUserDataCascade } = require('../core/deletion');
const { computeMerge } = require('../core/sync');
const { getLogicalDay } = require('../core/date');
const { COLLECTIONS, VALIDATORS } = require('../core/models');

function serverTimestamp() {
  if (admin && admin.firestore && admin.firestore.FieldValue && admin.firestore.FieldValue.serverTimestamp) {
    return admin.firestore.FieldValue.serverTimestamp();
  }
  return new Date();
}

async function setupTOTPHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const authClient = deps.auth || auth;
  const { uid, email } = requireCallableAuth(request, { requireTotp: false });

  const userRecord = await authClient.getUser(uid);
  const resolvedEmail = email || userRecord.email;

  const { secret, qrUri } = generateTOTPSecret(resolvedEmail, 'PureHabit');

  await dbClient.collection(COLLECTIONS.USERS).doc(uid).set(
    {
      id: uid,
      email: resolvedEmail || null,
      totp: {
        enabled: false,
        secret,
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
  const secret = userData.totp && userData.totp.secret;
  if (!secret) {
    throwHttpsError('failed-precondition', 'TOTP setup must be completed first.');
  }

  const valid = verifyTOTPToken(token, secret);

  if (valid) {
    await userRef.set(
      {
        totp: {
          enabled: true,
          secret,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await authClient.setCustomUserClaims(uid, { totpVerified: true });
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

  const timezone = token.timezone || 'UTC';
  let processedCount = 0;
  let writesInBatch = 0;
  let batch = dbClient.batch();
  const commits = [];

  for (const entry of logs) {
    if (!entry || typeof entry.habitId !== 'string' || !VALIDATORS.isValidDateString(entry.dateString)) {
      throwHttpsError('invalid-argument', 'Each log must include habitId and dateString (YYYY-MM-DD).');
    }

    const sourceIso =
      typeof entry.timestamp === 'string'
        ? entry.timestamp
        : `${entry.dateString}T12:00:00.000Z`;
    const logicalDay = getLogicalDay(sourceIso, timezone);
    const documentId = `${uid}_${entry.habitId}_${logicalDay}`;
    const reference = dbClient.collection(COLLECTIONS.HABIT_LOGS).doc(documentId);

    const currentDoc = await reference.get();
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

    batch.set(reference, merged, { merge: true });
    processedCount += 1;
    writesInBatch += 1;

    if (writesInBatch >= 450) {
      commits.push(batch.commit());
      batch = dbClient.batch();
      writesInBatch = 0;
    }
  }

  if (writesInBatch > 0) {
    commits.push(batch.commit());
  }

  await Promise.all(commits);

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
