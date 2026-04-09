const { computeMerge } = require('../../src/core/sync');

describe('computeMerge (US3)', () => {
  test('applies logical OR and keeps completed true when either side is true', () => {
    const merged = computeMerge(
      {
        habitId: 'habit-1',
        userId: 'user-1',
        dateString: '2026-04-08',
        completed: false,
        timestamp: '2026-04-08T09:00:00.000Z',
      },
      {
        habitId: 'habit-1',
        userId: 'user-1',
        dateString: '2026-04-08',
        completed: true,
        timestamp: '2026-04-08T08:00:00.000Z',
      }
    );

    expect(merged.completed).toBe(true);
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
});
