jest.mock('firebase-functions/v2/identity', () => ({
  onUserCreated: (handler) => handler,
}));

jest.mock('firebase-functions/v2/firestore', () => ({
  onDocumentWritten: (_path, handler) => handler,
}));

jest.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule: (_schedule, handler) => handler,
}));

const {
  onHabitLogWriteHandler,
  reminderSchedulerHandler,
} = require('../../src/handlers/triggers');

function cloneValue(value) {
  if (value === null || value === undefined) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

function createTriggersDbMock(seed = {}) {
  const store = {
    users: new Map(Object.entries(seed.users || {})),
    habits: new Map(Object.entries(seed.habits || {})),
    habit_logs: new Map(Object.entries(seed.habit_logs || {})),
    streak_status: new Map(Object.entries(seed.streak_status || {})),
  };

  let userGetCount = 0;

  function createDocSnapshot(collectionMap, id) {
    return {
      exists: collectionMap.has(id),
      data: () => cloneValue(collectionMap.get(id)),
      id,
    };
  }

  function getHabitQuery() {
    const docs = [...store.habits.entries()]
      .filter(([, habit]) => habit.archived === false)
      .map(([id, habit]) => ({
        id,
        data: () => cloneValue(habit),
      }));

    return {
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          startAfter: jest.fn(() => ({
            get: jest.fn(async () => ({ docs: [] })),
          })),
          get: jest.fn(async () => ({ docs })),
        })),
      })),
      get: jest.fn(async () => ({ docs })),
    };
  }

  function matchesFilter(log, field, op, expected) {
    const actual = log[field];

    if (op === '==') {
      return actual === expected;
    }

    if (op === '>=') {
      return actual >= expected;
    }

    if (op === '<=') {
      return actual <= expected;
    }

    return false;
  }

  function getHabitLogsFilter(filters) {
    const docs = [...store.habit_logs.values()]
      .filter((log) => filters.every(([field, op, expected]) => matchesFilter(log, field, op, expected)))
      .map((log) => ({
        data: () => cloneValue(log),
      }));

    return { docs };
  }

  function createWhereChain(filters) {
    return {
      where: jest.fn((nextField, nextOp, nextValue) =>
        createWhereChain([...filters, [nextField, nextOp, nextValue]])
      ),
      get: jest.fn(async () => getHabitLogsFilter(filters)),
    };
  }

  const db = {
    _store: store,
    _userGetCount: () => userGetCount,
    collection: jest.fn((collectionName) => {
      if (collectionName === 'habits') {
        return {
          doc: jest.fn((id) => ({
            get: jest.fn(async () => createDocSnapshot(store.habits, id)),
          })),
          where: jest.fn(() => getHabitQuery()),
        };
      }

      if (collectionName === 'users') {
        return {
          doc: jest.fn((id) => ({
            get: jest.fn(async () => {
              userGetCount += 1;
              return createDocSnapshot(store.users, id);
            }),
          })),
        };
      }

      if (collectionName === 'habit_logs') {
        return {
          doc: jest.fn((id) => ({
            get: jest.fn(async () => createDocSnapshot(store.habit_logs, id)),
          })),
          where: jest.fn((field, op, value) => createWhereChain([[field, op, value]])),
        };
      }

      if (collectionName === 'streak_status') {
        return {
          doc: jest.fn((id) => ({
            get: jest.fn(async () => createDocSnapshot(store.streak_status, id)),
            set: jest.fn(async (payload, options = {}) => {
              if (options.merge && store.streak_status.has(id)) {
                store.streak_status.set(id, {
                  ...cloneValue(store.streak_status.get(id)),
                  ...cloneValue(payload),
                });
                return;
              }

              store.streak_status.set(id, cloneValue(payload));
            }),
          })),
        };
      }

      throw new Error(`Unexpected collection: ${collectionName}`);
    }),
  };

  return db;
}

describe('trigger handlers', () => {
  test('onHabitLogWriteHandler uses user profile timezone for streak evaluation', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2026-04-09T09:00:00.000Z'));

    const db = createTriggersDbMock({
      users: {
        'user-1': { timezone: 'America/Los_Angeles' },
      },
      habits: {
        'habit-1': {
          userId: 'user-1',
          timezone: 'UTC',
          frequency: {
            type: 'SPECIFIC_DAYS',
            days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
          },
        },
      },
      habit_logs: {
        'user-1_habit-1_2026-04-08': {
          userId: 'user-1',
          habitId: 'habit-1',
          dateString: '2026-04-08',
          completed: true,
        },
      },
    });

    const event = {
      data: {
        after: {
          exists: true,
          data: () => ({
            userId: 'user-1',
            habitId: 'habit-1',
          }),
        },
      },
    };

    await onHabitLogWriteHandler(event, { db });

    const streak = db._store.streak_status.get('habit-1');
    expect(streak.currentStreak).toBe(1);
    expect(streak.lastEvaluatedDate).toBe('2026-04-08');

    jest.useRealTimers();
  });

  test('reminderSchedulerHandler caches user lookups and queues due reminders', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2026-04-10T03:00:00.000Z'));

    const db = createTriggersDbMock({
      users: {
        'user-1': { timezone: 'America/Los_Angeles', pushToken: 'push-token-1' },
      },
      habits: {
        'habit-1': {
          userId: 'user-1',
          archived: false,
          name: 'Read',
          reminders: [{ time: '20:00' }],
        },
        'habit-2': {
          userId: 'user-1',
          archived: false,
          name: 'Walk',
          reminders: [{ time: '20:00' }],
        },
      },
    });

    const messaging = {
      send: jest.fn().mockResolvedValue('ok'),
    };

    const result = await reminderSchedulerHandler({}, { db, messaging });

    expect(result).toEqual({ processedHabits: 2, remindersSent: 2 });
    expect(messaging.send).toHaveBeenCalledTimes(2);
    expect(db._userGetCount()).toBe(1);

    jest.useRealTimers();
  });

  test('reminderSchedulerHandler suppresses reminders for completed habits', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2026-04-10T03:00:00.000Z'));

    const db = createTriggersDbMock({
      users: {
        'user-1': { timezone: 'America/Los_Angeles', pushToken: 'push-token-1' },
      },
      habits: {
        'habit-1': {
          userId: 'user-1',
          archived: false,
          name: 'Read',
          reminders: [{ time: '20:00' }],
        },
      },
      habit_logs: {
        'user-1_habit-1_2026-04-09': {
          userId: 'user-1',
          habitId: 'habit-1',
          dateString: '2026-04-09',
          completed: true,
        },
      },
    });

    const messaging = {
      send: jest.fn().mockResolvedValue('ok'),
    };

    const result = await reminderSchedulerHandler({}, { db, messaging });

    expect(result).toEqual({ processedHabits: 1, remindersSent: 0 });
    expect(messaging.send).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('reminderSchedulerHandler enforces configured max habits per run', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2026-04-10T03:00:00.000Z'));

    const previousMax = process.env.REMINDER_MAX_HABITS_PER_RUN;
    const previousPageSize = process.env.REMINDER_PAGE_SIZE;
    process.env.REMINDER_MAX_HABITS_PER_RUN = '1';
    process.env.REMINDER_PAGE_SIZE = '1';

    const db = createTriggersDbMock({
      users: {
        'user-1': { timezone: 'America/Los_Angeles', pushToken: 'push-token-1' },
      },
      habits: {
        'habit-1': {
          userId: 'user-1',
          archived: false,
          name: 'Read',
          reminders: [{ time: '20:00' }],
        },
        'habit-2': {
          userId: 'user-1',
          archived: false,
          name: 'Walk',
          reminders: [{ time: '20:00' }],
        },
      },
    });

    const messaging = {
      send: jest.fn().mockResolvedValue('ok'),
    };

    try {
      const result = await reminderSchedulerHandler({}, { db, messaging });
      expect(result.processedHabits).toBe(1);
      expect(result.remindersSent).toBe(1);
    } finally {
      if (previousMax === undefined) {
        delete process.env.REMINDER_MAX_HABITS_PER_RUN;
      } else {
        process.env.REMINDER_MAX_HABITS_PER_RUN = previousMax;
      }

      if (previousPageSize === undefined) {
        delete process.env.REMINDER_PAGE_SIZE;
      } else {
        process.env.REMINDER_PAGE_SIZE = previousPageSize;
      }

      jest.useRealTimers();
    }
  });
});
