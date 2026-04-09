const { calculateStreaks } = require('../../src/core/streaks');

const mondayWednesdayFriday = {
  type: 'SPECIFIC_DAYS',
  days: ['MON', 'WED', 'FRI'],
};

describe('calculateStreaks (US4)', () => {
  test('supports invocation with no arguments', () => {
    const result = calculateStreaks();

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.lastEvaluatedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('computes current and longest streak for required days', () => {
    const result = calculateStreaks({
      frequency: mondayWednesdayFriday,
      todayDateString: '2026-04-10',
      logs: [
        { dateString: '2026-04-06', completed: true },
        { dateString: '2026-04-08', completed: true },
        { dateString: '2026-04-10', completed: true },
      ],
    });

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  test('breaks current streak when a required day is missed', () => {
    const result = calculateStreaks({
      frequency: mondayWednesdayFriday,
      todayDateString: '2026-04-10',
      logs: [
        { dateString: '2026-04-06', completed: true },
        { dateString: '2026-04-08', completed: false },
        { dateString: '2026-04-10', completed: true },
      ],
    });

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  test('preserves longest streak when rules are changed', () => {
    const result = calculateStreaks({
      frequency: {
        type: 'SPECIFIC_DAYS',
        days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      },
      previousLongest: 30,
      todayDateString: '2026-04-10',
      logs: [{ dateString: '2026-04-10', completed: true }],
    });

    expect(result.longestStreak).toBe(30);
  });

  test('coalesces duplicate logs on the same date using logical OR', () => {
    const result = calculateStreaks({
      frequency: {
        type: 'SPECIFIC_DAYS',
        days: ['FRI'],
      },
      todayDateString: '2026-04-10',
      logs: [
        { dateString: '2026-04-10', completed: false },
        { dateString: '2026-04-10', completed: true },
      ],
    });

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  test('skips non-required trailing days when computing current streak', () => {
    const result = calculateStreaks({
      frequency: {
        type: 'SPECIFIC_DAYS',
        days: ['MON'],
      },
      todayDateString: '2026-04-08',
      logs: [{ dateString: '2026-04-06', completed: true }],
    });

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  test('uses today as lastEvaluatedDate and preserves previousLongest with empty logs', () => {
    const result = calculateStreaks({
      frequency: {
        type: 'SPECIFIC_DAYS',
        days: ['THU'],
      },
      previousLongest: '4',
      todayDateString: '2026-04-09',
      logs: [],
    });

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(4);
    expect(result.lastEvaluatedDate).toBe('2026-04-09');
  });

  test('throws for invalid todayDateString input', () => {
    expect(() =>
      calculateStreaks({
        frequency: mondayWednesdayFriday,
        todayDateString: 'not-a-date',
        logs: [{ dateString: '2026-04-10', completed: true }],
      })
    ).toThrow('Invalid dateString');
  });

  test('ignores malformed log entries', () => {
    const result = calculateStreaks({
      frequency: {
        type: 'SPECIFIC_DAYS',
        days: ['FRI'],
      },
      todayDateString: '2026-04-10',
      logs: [null, { completed: true }, { dateString: 123, completed: true }],
    });

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
  });

  test('uses deterministic fallback date when no logs and no todayDateString are provided', () => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2026-04-12T09:00:00.000Z'));

    try {
      const result = calculateStreaks({
        frequency: {
          type: 'SPECIFIC_DAYS',
          days: ['SUN'],
        },
        previousLongest: 2,
        logs: null,
      });

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(2);
      expect(result.lastEvaluatedDate).toBe('2026-04-12');
    } finally {
      jest.useRealTimers();
    }
  });

  test('uses latest known log date when todayDateString is omitted', () => {
    const result = calculateStreaks({
      frequency: {
        type: 'SPECIFIC_DAYS',
        days: ['MON', 'WED'],
      },
      logs: [
        { dateString: '2026-04-06', completed: true },
        { dateString: '2026-04-08', completed: true },
      ],
    });

    expect(result.lastEvaluatedDate).toBe('2026-04-08');
  });
});
