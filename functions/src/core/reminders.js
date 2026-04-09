const { getLogicalDay, getLocalTimeParts } = require('./date');

function parseReminderTime(reminderTime) {
  if (typeof reminderTime !== 'string' || !/^\d{2}:\d{2}$/.test(reminderTime)) {
    return null;
  }

  const [hourString, minuteString] = reminderTime.split(':');
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

function isReminderDueNow(nowIso, timezone, reminderTime) {
  const target = parseReminderTime(reminderTime);
  if (!target) {
    return false;
  }

  const local = getLocalTimeParts(nowIso, timezone || 'UTC');
  return local.hour === target.hour && local.minute === target.minute;
}

function hasCompletionForLogicalDay(logByDate, logicalDay) {
  if (!logByDate) {
    return false;
  }

  if (logByDate instanceof Map) {
    return Boolean(logByDate.get(logicalDay));
  }

  return Boolean(logByDate[logicalDay]);
}

function shouldSendReminder({ habit, nowIso, timezone, completionByDate }) {
  if (!habit || habit.archived) {
    return false;
  }

  const reminders = Array.isArray(habit.reminders) ? habit.reminders : [];
  if (!reminders.length) {
    return false;
  }

  const logicalDay = getLogicalDay(nowIso, timezone || 'UTC');
  if (hasCompletionForLogicalDay(completionByDate, logicalDay)) {
    return false;
  }

  return reminders.some((entry) => {
    const reminderTime = entry && entry.time;
    return isReminderDueNow(nowIso, timezone || 'UTC', reminderTime);
  });
}

module.exports = {
  shouldSendReminder,
  isReminderDueNow,
};
