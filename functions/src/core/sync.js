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

function hasBoolean(value) {
  return typeof value === 'boolean';
}

function pickCompletedValue(localData = {}, remoteData = {}) {
  const hasLocalCompleted = hasBoolean(localData.completed);
  const hasRemoteCompleted = hasBoolean(remoteData.completed);
  const localTimestamp = normalizeTimestamp(localData.timestamp);
  const remoteTimestamp = normalizeTimestamp(remoteData.timestamp);

  if (hasLocalCompleted && hasRemoteCompleted) {
    if (localTimestamp && remoteTimestamp) {
      return localTimestamp >= remoteTimestamp
        ? localData.completed
        : remoteData.completed;
    }

    if (localTimestamp) {
      return localData.completed;
    }

    if (remoteTimestamp) {
      return remoteData.completed;
    }

    return localData.completed;
  }

  if (hasLocalCompleted) {
    return localData.completed;
  }

  if (hasRemoteCompleted) {
    return remoteData.completed;
  }

  return false;
}

function computeMerge(localData = {}, remoteData = {}) {
  const mergedCompleted = pickCompletedValue(localData, remoteData);
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
