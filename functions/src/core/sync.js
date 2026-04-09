function normalizeTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function pickLatestTimestamp(a, b) {
  const normalizedA = normalizeTimestamp(a);
  const normalizedB = normalizeTimestamp(b);

  if (!normalizedA) {
    return normalizedB;
  }
  if (!normalizedB) {
    return normalizedA;
  }

  return normalizedA >= normalizedB ? normalizedA : normalizedB;
}

function computeMerge(localData = {}, remoteData = {}) {
  const mergedCompleted = Boolean(localData.completed || remoteData.completed);
  const timestamp = pickLatestTimestamp(localData.timestamp, remoteData.timestamp);

  return {
    habitId: localData.habitId || remoteData.habitId || null,
    userId: localData.userId || remoteData.userId || null,
    dateString: localData.dateString || remoteData.dateString || null,
    completed: mergedCompleted,
    timestamp: timestamp || new Date().toISOString(),
  };
}

module.exports = {
  computeMerge,
};
