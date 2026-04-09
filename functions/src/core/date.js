const { GRACE_PERIOD_HOUR } = require('./models');

function isValidTimezone(timezone) {
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

function normalizeTimezone(primaryTimezone, fallbackTimezone = 'UTC') {
  if (isValidTimezone(primaryTimezone)) {
    return primaryTimezone;
  }

  if (isValidTimezone(fallbackTimezone)) {
    return fallbackTimezone;
  }

  return 'UTC';
}

function parseIso(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid ISO date string');
  }
  return date;
}

function getLocalTimeParts(isoString, timezone = 'UTC') {
  const date = typeof isoString === 'string' ? parseIso(isoString) : isoString;
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

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
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

function formatUtcDate(ms) {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getLogicalDay(isoString, timezone = 'UTC') {
  const parts = getLocalTimeParts(isoString, timezone);
  let utcMidnightMs = Date.UTC(parts.year, parts.month - 1, parts.day);

  if (parts.hour < GRACE_PERIOD_HOUR) {
    utcMidnightMs -= 24 * 60 * 60 * 1000;
  }

  return formatUtcDate(utcMidnightMs);
}

module.exports = {
  getLogicalDay,
  getLocalTimeParts,
  normalizeTimezone,
  isValidTimezone,
};