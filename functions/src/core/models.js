/**
 * models.js — Shared constants, collection names, and validation rules.
 *
 * This file contains NO business logic. It is a pure configuration module.
 */

// Firestore collection name keys
const COLLECTIONS = {
  USERS: 'users',
  HABITS: 'habits',
  HABIT_LOGS: 'habit_logs',
  STREAK_STATUS: 'streak_status',
};

// Valid day-of-week identifiers for habit frequency
const VALID_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Frequency types
const FREQUENCY_TYPES = {
  SPECIFIC_DAYS: 'SPECIFIC_DAYS',
};

// TOTP configuration constants
const TOTP_CONFIG = {
  DIGITS: 6,
  PERIOD: 30, // seconds
  ALGORITHM: 'sha1',
};

// Grace period: logical "day" ends at 3:00 AM local time
const GRACE_PERIOD_HOUR = 3;

// Validation helpers (pure, no side effects)
const VALIDATORS = {
  isValidDateString: (str) => /^\d{4}-\d{2}-\d{2}$/.test(str),
  isValidTOTPToken: (token) => /^\d{6}$/.test(token),
  isValidDays: (days) =>
    Array.isArray(days) &&
    days.length > 0 &&
    days.every((d) => VALID_DAYS.includes(d)),
};

module.exports = {
  COLLECTIONS,
  VALID_DAYS,
  FREQUENCY_TYPES,
  TOTP_CONFIG,
  GRACE_PERIOD_HOUR,
  VALIDATORS,
};
