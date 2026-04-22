const { shouldSendReminder } = require('../../src/core/reminders');

describe('shouldSendReminder (US5)', () => {
  const baseHabit = {
    id: 'habit-1',
    reminders: [{ time: '20:00' }],
    archived: false,
  };

  test('returns true when local reminder time matches and not completed', () => {
    const due = shouldSendReminder({
      habit: baseHabit,
      nowIso: '2026-04-10T03:00:00.000Z',
      timezone: 'America/Los_Angeles',
      completionByDate: {
        '2026-04-09': false,
      },
    });

    expect(due).toBe(true);
  });

  test('returns false when already completed for logical day', () => {
    const due = shouldSendReminder({
      habit: baseHabit,
      nowIso: '2026-04-10T03:00:00.000Z',
      timezone: 'America/Los_Angeles',
      completionByDate: {
        '2026-04-09': true,
      },
    });

    expect(due).toBe(false);
  });

  test('returns false when local time does not match reminder time', () => {
    const due = shouldSendReminder({
      habit: baseHabit,
      nowIso: '2026-04-10T02:30:00.000Z',
      timezone: 'America/Los_Angeles',
      completionByDate: {
        '2026-04-09': false,
      },
    });

    expect(due).toBe(false);
  });
});
