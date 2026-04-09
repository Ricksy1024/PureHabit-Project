const { COLLECTIONS } = require('./models');

async function deleteSnapshotDocs(dbClient, docs) {
  if (!docs.length) {
    return 0;
  }

  let deleted = 0;
  let opCount = 0;
  let batch = dbClient.batch();
  const commits = [];

  docs.forEach((doc) => {
    batch.delete(doc.ref);
    deleted += 1;
    opCount += 1;

    if (opCount >= 450) {
      commits.push(batch.commit());
      batch = dbClient.batch();
      opCount = 0;
    }
  });

  if (opCount > 0) {
    commits.push(batch.commit());
  }

  await Promise.all(commits);
  return deleted;
}

async function deleteByUserIdField(dbClient, collectionName, userId) {
  const snapshot = await dbClient.collection(collectionName).where('userId', '==', userId).get();
  return deleteSnapshotDocs(dbClient, snapshot.docs || []);
}

async function deleteUserDataCascade(userId, deps) {
  if (!userId) {
    throw new Error('userId is required for deletion cascade');
  }

  const dbClient = deps && deps.db;
  const authClient = deps && deps.auth;

  if (!dbClient || !authClient) {
    throw new Error('db and auth dependencies are required');
  }

  let deletedDocs = 0;

  deletedDocs += await deleteByUserIdField(dbClient, COLLECTIONS.HABITS, userId);
  deletedDocs += await deleteByUserIdField(dbClient, COLLECTIONS.HABIT_LOGS, userId);
  deletedDocs += await deleteByUserIdField(dbClient, COLLECTIONS.STREAK_STATUS, userId);

  const userRef = dbClient.collection(COLLECTIONS.USERS).doc(userId);
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    await userRef.delete();
    deletedDocs += 1;
  }

  await authClient.deleteUser(userId);

  return { success: true, deletedDocs };
}

module.exports = {
  deleteUserDataCascade,
};
