const { isHabitRequiredOnDate } = require('./rules');

function parseDateKey(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid dateString');
  }
  return date;
}

function toDateKey(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function enumerateDateKeys(startDateString, endDateString) {
  const start = parseDateKey(startDateString);
  const end = parseDateKey(endDateString);

  const keys = [];
  for (let cursor = start.getTime(); cursor <= end.getTime(); cursor += 24 * 60 * 60 * 1000) {
    keys.push(toDateKey(new Date(cursor)));
  }

  return keys;
}

function buildCompletionMap(logs) {
  const map = new Map();

  (logs || []).forEach((log) => {
    if (!log || typeof log.dateString !== 'string') {
      return;
    }

    const current = map.get(log.dateString) === true;
    map.set(log.dateString, current || Boolean(log.completed));
  });

  return map;
}

function calculateStreaks({
  logs = [],
  frequency,
  previousLongest = 0,
  todayDateString,
} = {}) {
  const completion = buildCompletionMap(logs);
  const knownDates = [...completion.keys()].sort();
  const startDateString = knownDates[0] || todayDateString || toDateKey(new Date());
  const endDateString = todayDateString || knownDates[knownDates.length - 1] || startDateString;

  const range = enumerateDateKeys(startDateString, endDateString);

  let rolling = 0;
  let longest = Number(previousLongest) || 0;

  range.forEach((dateKey) => {
    if (!isHabitRequiredOnDate(dateKey, frequency)) {
      return;
    }

    if (completion.get(dateKey) === true) {
      rolling += 1;
      longest = Math.max(longest, rolling);
    } else {
      rolling = 0;
    }
  });

  let currentStreak = 0;
  for (let i = range.length - 1; i >= 0; i -= 1) {
    const dateKey = range[i];
    if (!isHabitRequiredOnDate(dateKey, frequency)) {
      continue;
    }
    if (completion.get(dateKey) === true) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longest, Number(previousLongest) || 0),
    lastEvaluatedDate: endDateString,
  };
}

module.exports = {
  calculateStreaks,
};
