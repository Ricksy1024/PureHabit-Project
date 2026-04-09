async function sendHabitReminder(params = {}) {
  const messagingClient = params.messagingClient;
  const deviceToken = params.deviceToken;
  const habitId = params.habitId;
  const habitName = params.habitName || 'your habit';
  const userId = params.userId;

  if (!deviceToken) {
    return { success: false, skipped: true, reason: 'missing-device-token' };
  }

  if (!messagingClient || typeof messagingClient.send !== 'function') {
    return { success: false, skipped: true, reason: 'messaging-not-configured' };
  }

  const message = {
    token: deviceToken,
    notification: {
      title: 'PureHabit Reminder',
      body: `Time to complete ${habitName}.`,
    },
    data: {
      type: 'habit_reminder',
      userId: String(userId || ''),
      habitId: String(habitId || ''),
    },
  };

  await messagingClient.send(message);
  return { success: true };
}

module.exports = {
  sendHabitReminder,
};
