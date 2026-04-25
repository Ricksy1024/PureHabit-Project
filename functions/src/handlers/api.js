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
const { deleteUserDataCascade, deleteUserHabitData } = require('../core/deletion');
const { computeMerge } = require('../core/sync');
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

function validateSyncLogEntry(entry) {
  if (!entry || typeof entry.habitId !== 'string' || !VALIDATORS.isValidDateString(entry.dateString)) {
    throwHttpsError('invalid-argument', 'Each log must include habitId and dateString (YYYY-MM-DD).');
  }

  if (typeof entry.completed !== 'boolean') {
    throwHttpsError('invalid-argument', 'Each log must include completed as a boolean value.');
  }

  if (entry.timestamp !== undefined && entry.timestamp !== null && typeof entry.timestamp !== 'string') {
    throwHttpsError('invalid-argument', 'timestamp must be a valid ISO-8601 date string.');
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
  const { uid, email } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: authClient }
  );

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
  const { uid } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: authClient }
  );
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
  const { uid } = await requireCallableAuth(request, {}, { auth: authClient });

  await deleteUserDataCascade(uid, {
    db: dbClient,
    auth: authClient,
  });

  return {
    success: true,
    message: 'Account scheduled for deletion or instantly deleted.',
  };
}

async function deleteUserDataActionHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const authClient = deps.auth || auth;
  const { uid } = await requireCallableAuth(request, {}, { auth: authClient });

  const result = await deleteUserHabitData(uid, {
    db: dbClient,
  });

  return {
    success: true,
    deletedDocs: result.deletedDocs,
    message: 'Habit data deleted.',
  };
}

async function syncHabitLogsHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const authClient = deps.auth || auth;
  const { uid } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: authClient }
  );
  const logs = request && request.data && request.data.logs;

  if (!Array.isArray(logs)) {
    throwHttpsError('invalid-argument', 'logs must be an array.');
  }

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

    // The client already computes the selected logical day.
    // Persist that exact day so switching dates reloads the same record.
    const logicalDay = entry.dateString;

    const documentId = `${uid}_${entry.habitId}_${logicalDay}`;
    const reference = dbClient.collection(COLLECTIONS.HABIT_LOGS).doc(documentId);

    await dbClient.runTransaction(async (transaction) => {
      const currentDoc = await transaction.get(reference);
      const merged = computeMerge(
        {
          habitId: entry.habitId,
          userId: uid,
          dateString: logicalDay,
          completed: entry.completed,
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

// [SECURITY-GAP]
async function createHabitActionHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const { uid } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: deps.auth || auth }
  );
  const data = request.data || {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throwHttpsError('invalid-argument', 'Habit name is required.');
  }

  if (!data.frequency || !VALIDATORS.isValidDays(data.frequency.days)) {
    throwHttpsError('invalid-argument', 'Valid frequency days are required.');
  }

  const habitRef = dbClient.collection(COLLECTIONS.HABITS).doc();
  const habitId = habitRef.id;

  await habitRef.set({
    id: habitId,
    userId: uid,
    name: data.name.trim(),
    frequency: {
      type: 'SPECIFIC_DAYS',
      days: data.frequency.days,
    },
    reminders: Array.isArray(data.reminders) ? data.reminders : [],
    category: data.category || '',
    uiBgColor: data.uiBgColor || 'bg-blue-500',
    uiIconName: data.uiIconName || 'Activity',
    uiMetric: data.uiMetric || 'times',
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { success: true, habitId };
}

// [SECURITY-GAP]
async function updateHabitActionHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const { uid } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: deps.auth || auth }
  );
  const { habitId, ...updates } = request.data || {};

  if (!habitId) {
    throwHttpsError('invalid-argument', 'habitId is required.');
  }

  const habitRef = dbClient.collection(COLLECTIONS.HABITS).doc(habitId);
  const habitSnap = await habitRef.get();

  if (!habitSnap.exists) {
    throwHttpsError('not-found', 'Habit not found.');
  }

  if (habitSnap.data().userId !== uid) {
    throwHttpsError('permission-denied', 'You do not own this habit.');
  }

  const payload = { updatedAt: serverTimestamp() };
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.frequency && VALIDATORS.isValidDays(updates.frequency.days)) {
    payload.frequency = { type: 'SPECIFIC_DAYS', days: updates.frequency.days };
  }
  if (updates.reminders !== undefined) payload.reminders = updates.reminders;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.uiBgColor !== undefined) payload.uiBgColor = updates.uiBgColor;
  if (updates.uiIconName !== undefined) payload.uiIconName = updates.uiIconName;
  if (updates.uiMetric !== undefined) payload.uiMetric = updates.uiMetric;

  await habitRef.update(payload);

  return { success: true, habitId };
}

// [SECURITY-GAP]
async function archiveHabitActionHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const { uid } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: deps.auth || auth }
  );
  const { habitId } = request.data || {};

  if (!habitId) {
    throwHttpsError('invalid-argument', 'habitId is required.');
  }

  const habitRef = dbClient.collection(COLLECTIONS.HABITS).doc(habitId);
  const habitSnap = await habitRef.get();

  if (!habitSnap.exists) {
    throwHttpsError('not-found', 'Habit not found.');
  }

  if (habitSnap.data().userId !== uid) {
    throwHttpsError('permission-denied', 'You do not own this habit.');
  }

  await habitRef.update({
    archived: true,
    updatedAt: serverTimestamp(),
  });

  return { success: true, habitId };
}

// [SECURITY-GAP]
async function registerDeviceTokenActionHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const { uid } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: deps.auth || auth }
  );
  const { token } = request.data || {};

  if (!token || typeof token !== 'string') {
    throwHttpsError('invalid-argument', 'Valid push token is required.');
  }

  await dbClient.collection(COLLECTIONS.USERS).doc(uid).set({
    pushToken: token,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return { success: true };
}

// [SECURITY-GAP]
async function batchRenameCategoryActionHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const authClient = deps.auth || auth;
  const { uid } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: authClient }
  );
  const { oldName, newName } = request.data || {};

  if (typeof oldName !== 'string' || typeof newName !== 'string') {
    throwHttpsError('invalid-argument', 'oldName and newName are required strings.');
  }

  const habitsQuery = dbClient.collection(COLLECTIONS.HABITS)
    .where('userId', '==', uid)
    .where('category', '==', oldName);

  const snapshot = await habitsQuery.get();
  
  const batch = dbClient.batch();
  let count = 0;
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { category: newName, updatedAt: serverTimestamp() });
    count++;
  });

  if (count > 0) {
    await batch.commit();
  }

  return { success: true, updatedCount: count };
}

// [SECURITY-GAP]
async function updateUserProfileActionHandler(request, deps = {}) {
  const dbClient = deps.db || db;
  const authClient = deps.auth || auth;
  const { uid } = await requireCallableAuth(
    request,
    { requireTotp: false },
    { auth: authClient }
  );
  const { displayName, timezone } = request.data || {};

  const updates = { updatedAt: serverTimestamp() };
  
  if (displayName !== undefined && typeof displayName === 'string') {
    await authClient.updateUser(uid, { displayName });
    updates.displayName = displayName;
  }
  
  if (timezone !== undefined && typeof timezone === 'string') {
    if (!require('../core/date').isValidTimezone(timezone)) {
      throwHttpsError('invalid-argument', 'Invalid IANA timezone string.');
    }
    updates.timezone = timezone;
  }
  
  await dbClient.collection(COLLECTIONS.USERS).doc(uid).set(updates, { merge: true });
  
  return { success: true };
}

const setupTOTP = onCall(withErrorHandling((request) => setupTOTPHandler(request)));
const verifyTOTP = onCall(withErrorHandling((request) => verifyTOTPHandler(request)));
const deleteAccountAction = onCall(
  withErrorHandling((request) => deleteAccountActionHandler(request))
);
const deleteUserDataAction = onCall(
  withErrorHandling((request) => deleteUserDataActionHandler(request))
);
const syncHabitLogs = onCall(withErrorHandling((request) => syncHabitLogsHandler(request)));
const createHabitAction = onCall(withErrorHandling((request) => createHabitActionHandler(request)));
const updateHabitAction = onCall(withErrorHandling((request) => updateHabitActionHandler(request)));
const archiveHabitAction = onCall(withErrorHandling((request) => archiveHabitActionHandler(request)));
const registerDeviceTokenAction = onCall(withErrorHandling((request) => registerDeviceTokenActionHandler(request)));
const batchRenameCategoryAction = onCall(withErrorHandling((request) => batchRenameCategoryActionHandler(request)));
const updateUserProfileAction = onCall(withErrorHandling((request) => updateUserProfileActionHandler(request)));

module.exports = {
  setupTOTP,
  verifyTOTP,
  deleteAccountAction,
  deleteUserDataAction,
  syncHabitLogs,
  createHabitAction,
  updateHabitAction,
  archiveHabitAction,
  registerDeviceTokenAction,
  batchRenameCategoryAction,
  updateUserProfileAction,
  setupTOTPHandler,
  verifyTOTPHandler,
  deleteAccountActionHandler,
  deleteUserDataActionHandler,
  syncHabitLogsHandler,
  createHabitActionHandler,
  updateHabitActionHandler,
  archiveHabitActionHandler,
  registerDeviceTokenActionHandler,
  batchRenameCategoryActionHandler,
  updateUserProfileActionHandler,
};
