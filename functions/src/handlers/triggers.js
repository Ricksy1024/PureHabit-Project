const { user } = require('firebase-functions/v1/auth');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { admin, db } = require('./db');
const { COLLECTIONS, FREQUENCY_TYPES, VALIDATORS } = require('../core/models');
const { calculateStreaks } = require('../core/streaks');
const { getLogicalDay, normalizeTimezone } = require('../core/date');
const { shouldSendReminder } = require('../core/reminders');
const { sendHabitReminder } = require('./notifications');

const DEFAULT_STREAK_RECALC_WINDOW_DAYS = 730;
const DEFAULT_REMINDER_PAGE_SIZE = 100;
const DEFAULT_REMINDER_MAX_HABITS_PER_RUN = 1000;
const DEFAULT_REMINDER_CONCURRENCY = 20;
const DEFAULT_REMINDER_WARN_USAGE_RATIO = 0.8;
const DEFAULT_REMINDER_PARTITION_COUNT = 1;

function serverTimestamp() {
  if (admin && admin.firestore && admin.firestore.FieldValue && admin.firestore.FieldValue.serverTimestamp) {
    return admin.firestore.FieldValue.serverTimestamp();
  }
  return new Date();
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseRatio(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1) {
    return fallback;
  }
  return parsed;
}

function parsePartitionSlot(value, partitionCount, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed >= partitionCount) {
    return fallback;
  }
  return parsed;
}

function stableStringHash(value) {
  const stringValue = String(value || '');
  let hash = 0;

  for (let i = 0; i < stringValue.length; i += 1) {
    hash = (hash + stringValue.charCodeAt(i)) % 2147483647;
  }

  return hash;
}

function shouldProcessHabitInPartition(habitId, partitionCount, partitionSlot) {
  if (partitionCount <= 1) {
    return true;
  }

  return stableStringHash(habitId) % partitionCount === partitionSlot;
}

function shiftDateStringUtc(dateString, daysDelta) {
  if (!VALIDATORS.isValidDateString(dateString)) {
    return null;
  }

  const [yearString, monthString, dayString] = dateString.split('-');
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + Number(daysDelta || 0));

  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

async function fetchLogsForStreakWindow(dbClient, habitId, userId, startDateString, endDateString) {
  let query = dbClient
    .collection(COLLECTIONS.HABIT_LOGS)
    .where('habitId', '==', habitId)
    .where('userId', '==', userId);

  if (VALIDATORS.isValidDateString(startDateString)) {
    query = query.where('dateString', '>=', startDateString);
  }

  if (VALIDATORS.isValidDateString(endDateString)) {
    query = query.where('dateString', '<=', endDateString);
  }

  const logsSnapshot = await query.get();
  return (logsSnapshot.docs || []).map((doc) => doc.data());
}

async function processReminderHabit(params) {
  const {
    dbClient,
    messagingClient,
    userCache,
    nowIso,
    habitDoc,
  } = params;

  const habit = habitDoc.data() || {};
  const habitId = habitDoc.id;
  const userId = habit.userId;

  if (!userId) {
    return false;
  }

  const user = await getUserDataCached(dbClient, userId, userCache);
  if (!user) {
    return false;
  }

  const timezone = normalizeTimezone(user.timezone, 'UTC');
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
    return false;
  }

  const sendResult = await sendHabitReminder({
    messagingClient,
    deviceToken: user.pushToken,
    userId,
    habitId,
    habitName: habit.name,
  });

  return Boolean(sendResult && sendResult.success);
}

async function getUserDataCached(dbClient, userId, userCache) {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }

  const pending = dbClient
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .get()
    .then((snapshot) => (snapshot.exists ? snapshot.data() || {} : null));

  userCache.set(userId, pending);

  try {
    const userData = await pending;
    userCache.set(userId, userData);
    return userData;
  } catch (error) {
    userCache.delete(userId);
    throw error;
  }
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
  const userSnapshot = await dbClient.collection(COLLECTIONS.USERS).doc(userId).get();
  const userData = userSnapshot.exists ? userSnapshot.data() || {} : {};
  const timezone = normalizeTimezone(userData.timezone, normalizeTimezone(habit.timezone, 'UTC'));
  const frequency = habit.frequency || {
    type: FREQUENCY_TYPES.SPECIFIC_DAYS,
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  };

  const statusRef = dbClient.collection(COLLECTIONS.STREAK_STATUS).doc(habitId);
  const existingStatus = await statusRef.get();
  const previousLongest = existingStatus.exists
    ? Number((existingStatus.data() || {}).longestStreak || 0)
    : 0;

  const nowIso = new Date().toISOString();
  const todayDateString = getLogicalDay(nowIso, timezone);
  const rawAffectedDateString = VALIDATORS.isValidDateString(log.dateString)
    ? log.dateString
    : todayDateString;
  const streakRecalcWindowDays = parsePositiveInt(
    process.env.STREAK_RECALC_WINDOW_DAYS,
    DEFAULT_STREAK_RECALC_WINDOW_DAYS
  );
  const boundedWindowFloor = shiftDateStringUtc(todayDateString, -(streakRecalcWindowDays - 1));
  const candidateWindowStart = shiftDateStringUtc(
    rawAffectedDateString,
    -(streakRecalcWindowDays - 1)
  );
  const windowStartDateString =
    !candidateWindowStart || candidateWindowStart < boundedWindowFloor
      ? boundedWindowFloor
      : candidateWindowStart;

  const logs = await fetchLogsForStreakWindow(
    dbClient,
    habitId,
    userId,
    windowStartDateString,
    todayDateString
  );

  const streaks = calculateStreaks({
    logs,
    frequency,
    previousLongest,
    todayDateString,
  });

  if (streaks.currentStreak >= streakRecalcWindowDays) {
    console.warn(
      `Streak recalculation hit configured window for habit ${habitId}. Consider increasing STREAK_RECALC_WINDOW_DAYS.`
    );
  }

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

  const pageSize = parsePositiveInt(process.env.REMINDER_PAGE_SIZE, DEFAULT_REMINDER_PAGE_SIZE);
  const maxHabitsPerRun = Math.max(
    pageSize,
    parsePositiveInt(process.env.REMINDER_MAX_HABITS_PER_RUN, DEFAULT_REMINDER_MAX_HABITS_PER_RUN)
  );
  const reminderConcurrency = parsePositiveInt(
    process.env.REMINDER_CONCURRENCY,
    DEFAULT_REMINDER_CONCURRENCY
  );
  const partitionCount = parsePositiveInt(
    process.env.REMINDER_PARTITION_COUNT,
    DEFAULT_REMINDER_PARTITION_COUNT
  );
  const fallbackPartitionSlot = new Date(nowIso).getUTCMinutes() % partitionCount;
  const partitionSlot = parsePartitionSlot(
    process.env.REMINDER_PARTITION_SLOT,
    partitionCount,
    fallbackPartitionSlot
  );
  const warnUsageRatio = parseRatio(
    process.env.REMINDER_WARN_USAGE_RATIO,
    DEFAULT_REMINDER_WARN_USAGE_RATIO
  );
  const warnThreshold = Math.max(pageSize, Math.floor(maxHabitsPerRun * warnUsageRatio));

  const userCache = new Map();
  let lastDoc = null;
  let processedHabits = 0;
  let remindersSent = 0;

  while (processedHabits < maxHabitsPerRun) {
    let query = dbClient
      .collection(COLLECTIONS.HABITS)
      .where('archived', '==', false)
      .orderBy('__name__')
      .limit(pageSize);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const habitsSnapshot = await query.get();
    const habits = habitsSnapshot.docs || [];
    if (!habits.length) {
      break;
    }

    let index = 0;
    const workerCount = Math.max(1, Math.min(reminderConcurrency, habits.length));
    const workers = Array.from({ length: workerCount }, async () => {
      while (index < habits.length && processedHabits < maxHabitsPerRun) {
        const currentIndex = index;
        index += 1;
        const habitDoc = habits[currentIndex];

        if (!shouldProcessHabitInPartition(habitDoc && habitDoc.id, partitionCount, partitionSlot)) {
          continue;
        }

        if (processedHabits >= maxHabitsPerRun) {
          break;
        }

        processedHabits += 1;

        try {
          const sent = await processReminderHabit({
            dbClient,
            messagingClient,
            userCache,
            nowIso,
            habitDoc,
          });

          if (sent) {
            remindersSent += 1;
          }
        } catch (error) {
          console.error('Failed to process habit reminder', {
            habitId: habitDoc && habitDoc.id,
            error: error && error.message,
          });
        }
      }
    });

    await Promise.all(workers);

    if (habits.length < pageSize) {
      break;
    }

    lastDoc = habits[habits.length - 1];
  }

  if (processedHabits >= warnThreshold) {
    console.warn(
      `Reminder scheduler processed ${processedHabits}/${maxHabitsPerRun} habits. Consider tuning REMINDER_MAX_HABITS_PER_RUN.`
    );
  }

  if (processedHabits >= maxHabitsPerRun) {
    console.warn('Reminder scheduler reached max habits per run and stopped early.');
  }

  console.info('Reminder scheduler run summary', {
    processedHabits,
    remindersSent,
    pageSize,
    maxHabitsPerRun,
    reminderConcurrency,
    partitionCount,
    partitionSlot,
  });

  return {
    processedHabits,
    remindersSent,
  };
}

const onUserCreate = user().onCreate((authUser) => onUserCreateHandler({ data: authUser }));
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
