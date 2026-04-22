const { FREQUENCY_TYPES, VALID_DAYS } = require('./models');

const JS_DAY_TO_CODE = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function parseDateString(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid dateString');
  }
  return date;
}

function normalizeDays(days) {
  if (!Array.isArray(days)) {
    return [];
  }
  return days.filter((day) => VALID_DAYS.includes(day));
}

function dayCodeFromDateString(dateString) {
  const date = parseDateString(dateString);
  return JS_DAY_TO_CODE[date.getUTCDay()];
}

function isHabitRequiredOnDate(dateString, frequency) {
  if (!frequency || frequency.type !== FREQUENCY_TYPES.SPECIFIC_DAYS) {
    return false;
  }

  const requiredDays = normalizeDays(frequency.days);
  if (!requiredDays.length) {
    return false;
  }

  const dayCode = dayCodeFromDateString(dateString);
  return requiredDays.includes(dayCode);
}

module.exports = {
  isHabitRequiredOnDate,
  dayCodeFromDateString,
};
