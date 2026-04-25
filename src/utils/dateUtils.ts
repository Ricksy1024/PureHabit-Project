export function isValidTimezone(timezone: string): boolean {
  if (typeof timezone !== 'string' || !timezone) {
    return false;
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch (_error) {
    return false;
  }
}

export function normalizeTimezone(primaryTimezone: string, fallbackTimezone = 'UTC'): string {
  if (isValidTimezone(primaryTimezone)) {
    return primaryTimezone;
  }

  if (isValidTimezone(fallbackTimezone)) {
    return fallbackTimezone;
  }

  return 'UTC';
}

export function getLocalTimeParts(isoString: string | Date, timezone = 'UTC') {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid ISO date string');
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date).reduce((acc: Record<string, number>, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = Number(part.value);
    }
    return acc;
  }, {});

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

export function formatUtcDate(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function logicalDay(timezone: string = 'UTC', dateInput: Date = new Date()): string {
  const GRACE_PERIOD_HOUR = 3;
  const parts = getLocalTimeParts(dateInput, timezone);
  
  let utcMidnightMs = Date.UTC(parts.year, parts.month - 1, parts.day);

  if (parts.hour < GRACE_PERIOD_HOUR) {
    utcMidnightMs -= 24 * 60 * 60 * 1000;
  }

  return formatUtcDate(utcMidnightMs);
}

export function calendarDateToLogicalDay(
  timezone: string = 'UTC',
  dateInput: Date = new Date(),
): string {
  const stableDate = new Date(dateInput);
  stableDate.setHours(12, 0, 0, 0);
  return logicalDay(timezone, stableDate);
}
