const { onUserCreated } = require('firebase-functions/v2/identity');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { admin, db } = require('./db');
const { COLLECTIONS, FREQUENCY_TYPES } = require('../core/models');
const { calculateStreaks } = require('../core/streaks');
const { getLogicalDay } = require('../core/date');
const { shouldSendReminder } = require('../core/reminders');
const { sendHabitReminder } = require('./notifications');

function serverTimestamp() {
  if (admin && admin.firestore && admin.firestore.FieldValue && admin.firestore.FieldValue.serverTimestamp) {
    return admin.firestore.FieldValue.serverTimestamp();
  }
  return new Date();
}

async function onUserCreateHandler(event, deps = {}) {
  const dbClient = deps.db || db;
  const user = event && event.data;

  if (!user || !user.uid) {
    return;
  }

  await dbClient.collection(COLLECTIONS.USERS).doc(user.uid).set(
    {
      id: user.uid,
      email: user.email || null,
      timezone: 'UTC',
      totp: {
        enabled: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function onHabitLogWriteHandler(event, deps = {}) {
  const dbClient = deps.db || db;
  const after = event && event.data && event.data.after;
  if (!after || !after.exists) {
    return;
  }

  const log = after.data() || {};
  const habitId = log.habitId;
  const userId = log.userId;

  if (!habitId || !userId) {
    return;
  }

  const habitSnapshot = await dbClient.collection(COLLECTIONS.HABITS).doc(habitId).get();
  if (!habitSnapshot.exists) {
    return;
  }

  const habit = habitSnapshot.data() || {};
  const frequency = habit.frequency || {
    type: FREQUENCY_TYPES.SPECIFIC_DAYS,
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  };

  const logsSnapshot = await dbClient
    .collection(COLLECTIONS.HABIT_LOGS)
    .where('habitId', '==', habitId)
    .where('userId', '==', userId)
    .get();

  const logs = (logsSnapshot.docs || []).map((doc) => doc.data());
  const statusRef = dbClient.collection(COLLECTIONS.STREAK_STATUS).doc(habitId);
  const existingStatus = await statusRef.get();
  const previousLongest = existingStatus.exists
    ? Number((existingStatus.data() || {}).longestStreak || 0)
    : 0;

  const todayDateString = getLogicalDay(new Date().toISOString(), habit.timezone || 'UTC');
  const streaks = calculateStreaks({
    logs,
    frequency,
    previousLongest,
    todayDateString,
  });

  await statusRef.set(
    {
      habitId,
      userId,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      lastEvaluatedDate: streaks.lastEvaluatedDate,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function reminderSchedulerHandler(_event, deps = {}) {
  const dbClient = deps.db || db;
  const messagingClient = deps.messaging || admin.messaging();
  const nowIso = new Date().toISOString();

  const habitsSnapshot = await dbClient.collection(COLLECTIONS.HABITS).where('archived', '==', false).get();

  for (const habitDoc of habitsSnapshot.docs || []) {
    const habit = habitDoc.data() || {};
    const habitId = habitDoc.id;
    const userId = habit.userId;

    if (!userId) {
      continue;
    }

    const userSnapshot = await dbClient.collection(COLLECTIONS.USERS).doc(userId).get();
    if (!userSnapshot.exists) {
      continue;
    }

    const user = userSnapshot.data() || {};
    const timezone = user.timezone || 'UTC';
    const logicalDay = getLogicalDay(nowIso, timezone);
    const logDocId = `${userId}_${habitId}_${logicalDay}`;
    const logSnapshot = await dbClient.collection(COLLECTIONS.HABIT_LOGS).doc(logDocId).get();

    const completionByDate = {
      [logicalDay]: logSnapshot.exists ? Boolean((logSnapshot.data() || {}).completed) : false,
    };

    const due = shouldSendReminder({
      habit,
      nowIso,
      timezone,
      completionByDate,
    });

    if (!due) {
      continue;
    }

    await sendHabitReminder({
      messagingClient,
      deviceToken: user.pushToken,
      userId,
      habitId,
      habitName: habit.name,
    });
  }
}

const onUserCreate = onUserCreated(onUserCreateHandler);
const onHabitLogWrite = onDocumentWritten('habit_logs/{logId}', onHabitLogWriteHandler);
const reminderScheduler = onSchedule('every 1 minutes', reminderSchedulerHandler);

module.exports = {
  onUserCreate,
  onHabitLogWrite,
  reminderScheduler,
  onUserCreateHandler,
  onHabitLogWriteHandler,
  reminderSchedulerHandler,
};
