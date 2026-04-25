const { computeMerge } = require('../../src/core/sync');

describe('computeMerge (US3)', () => {
  test('uses the newer timestamp to decide the merged completed state', () => {
    const merged = computeMerge(
      {
        habitId: 'habit-1',
        userId: 'user-1',
        dateString: '2026-04-08',
        completed: false,
        timestamp: '2026-04-08T10:00:00.000Z',
      },
      {
        habitId: 'habit-1',
        userId: 'user-1',
        dateString: '2026-04-08',
        completed: true,
        timestamp: '2026-04-08T09:00:00.000Z',
      }
    );

    expect(merged.completed).toBe(false);
  });

  test('returns false when both local and remote are false', () => {
    const merged = computeMerge(
      {
        habitId: 'habit-1',
        userId: 'user-1',
        dateString: '2026-04-08',
        completed: false,
      },
      {
        habitId: 'habit-1',
        userId: 'user-1',
        dateString: '2026-04-08',
        completed: false,
      }
    );

    expect(merged.completed).toBe(false);
  });

  test('allows a later false update to undo an earlier true completion', () => {
    const merged = computeMerge(
      {
        habitId: 'habit-1',
        userId: 'user-1',
        dateString: '2026-04-08',
        completed: false,
        timestamp: '2026-04-08T11:00:00.000Z',
      },
      {
        habitId: 'habit-1',
        userId: 'user-1',
        dateString: '2026-04-08',
        completed: true,
        timestamp: '2026-04-08T09:00:00.000Z',
      }
    );

    expect(merged.completed).toBe(false);
    expect(merged.timestamp).toBe('2026-04-08T11:00:00.000Z');
  });

  test('keeps latest valid timestamp and identifiers', () => {
    const merged = computeMerge(
      {
        habitId: 'habit-2',
        userId: 'user-2',
        dateString: '2026-04-09',
        completed: true,
        timestamp: '2026-04-09T11:30:00.000Z',
      },
      {
        habitId: 'habit-2',
        userId: 'user-2',
        dateString: '2026-04-09',
        completed: false,
        timestamp: '2026-04-09T10:30:00.000Z',
      }
    );

    expect(merged.habitId).toBe('habit-2');
    expect(merged.userId).toBe('user-2');
    expect(merged.dateString).toBe('2026-04-09');
    expect(merged.timestamp).toBe('2026-04-09T11:30:00.000Z');
  });

  test('falls back to remote identifiers when local identifiers are missing', () => {
    const merged = computeMerge(
      {
        completed: false,
        timestamp: '2026-04-09T10:30:00.000Z',
      },
      {
        habitId: 'habit-3',
        userId: 'user-3',
        dateString: '2026-04-09',
        completed: true,
        timestamp: '2026-04-09T09:30:00.000Z',
      }
    );

    expect(merged.habitId).toBe('habit-3');
    expect(merged.userId).toBe('user-3');
    expect(merged.dateString).toBe('2026-04-09');
  });

  test('prefers remote timestamp when local timestamp is invalid', () => {
    const merged = computeMerge(
      {
        completed: false,
        timestamp: 'not-a-date',
      },
      {
        completed: true,
        timestamp: '2026-04-09T12:00:00.000Z',
      }
    );

    expect(merged.timestamp).toBe('2026-04-09T12:00:00.000Z');
  });

  test('uses local timestamp when remote timestamp is missing', () => {
    const merged = computeMerge(
      {
        completed: true,
        timestamp: '2026-04-09T12:00:00.000Z',
      },
      {
        completed: false,
      }
    );

    expect(merged.timestamp).toBe('2026-04-09T12:00:00.000Z');
  });

  test('uses current time when both timestamps are invalid or missing', () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2026-04-09T15:45:00.000Z'));

    try {
      const merged = computeMerge(
        {
          completed: false,
          timestamp: 'bad-local',
        },
        {
          completed: false,
          timestamp: null,
        }
      );

      expect(merged.habitId).toBeNull();
      expect(merged.userId).toBeNull();
      expect(merged.dateString).toBeNull();
      expect(merged.timestamp).toBe('2026-04-09T15:45:00.000Z');
    } finally {
      jest.useRealTimers();
    }
  });

  test('uses remote timestamp and state when it is newer than local timestamp', () => {
    const merged = computeMerge(
      {
        completed: false,
        timestamp: '2026-04-09T08:00:00.000Z',
      },
      {
        completed: true,
        timestamp: '2026-04-09T09:00:00.000Z',
      }
    );

    expect(merged.timestamp).toBe('2026-04-09T09:00:00.000Z');
    expect(merged.completed).toBe(true);
  });

  test('supports default arguments when merge payloads are omitted', () => {
    const merged = computeMerge();

    expect(merged.completed).toBe(false);
    expect(merged.habitId).toBeNull();
    expect(merged.userId).toBeNull();
    expect(merged.dateString).toBeNull();
    expect(typeof merged.timestamp).toBe('string');
  });
});
