const { getLogicalDay } = require('../../src/core/date');

describe('getLogicalDay (US3)', () => {
  test('maps times before 3:00 AM to the previous logical day in UTC', () => {
    const logicalDay = getLogicalDay('2026-04-09T01:30:00.000Z', 'UTC');
    expect(logicalDay).toBe('2026-04-08');
  });

  test('keeps same day at or after 3:00 AM in UTC', () => {
    const logicalDay = getLogicalDay('2026-04-09T03:00:00.000Z', 'UTC');
    expect(logicalDay).toBe('2026-04-09');
  });

  test('applies grace period correctly for local timezone', () => {
    const logicalDay = getLogicalDay('2026-04-09T09:30:00.000Z', 'America/Los_Angeles');
    expect(logicalDay).toBe('2026-04-08');
  });
});
