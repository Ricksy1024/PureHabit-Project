const { calculateStreaks } = require('../../src/core/streaks');

const mondayWednesdayFriday = {
  type: 'SPECIFIC_DAYS',
  days: ['MON', 'WED', 'FRI'],
};

describe('calculateStreaks (US4)', () => {
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
});
