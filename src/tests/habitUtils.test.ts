import { describe, expect, it } from 'vitest';
import { getWeekLogicalDates } from '../utils/habitUtils';

describe('habitUtils week activity dates', () => {
  it('returns Monday-through-Sunday dates for the selected week', () => {
    const dates = getWeekLogicalDates(
      new Date('2026-04-22T12:00:00.000Z'),
      'UTC',
    );

    expect(dates).toEqual([
      '2026-04-20',
      '2026-04-21',
      '2026-04-22',
      '2026-04-23',
      '2026-04-24',
      '2026-04-25',
      '2026-04-26',
    ]);
  });

  it('stays on the same week when switching days inside that week', () => {
    const mondaySelection = getWeekLogicalDates(
      new Date('2026-04-20T12:00:00.000Z'),
      'UTC',
    );
    const fridaySelection = getWeekLogicalDates(
      new Date('2026-04-24T12:00:00.000Z'),
      'UTC',
    );

    expect(fridaySelection).toEqual(mondaySelection);
  });
});
