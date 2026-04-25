const {
  deleteUserHabitData,
  deleteUserDataCascade,
} = require('../../src/core/deletion');

describe('deleteUserDataCascade (US2)', () => {
  function createDbMock() {
    const batches = [];

    const docsByCollection = {
      habits: [{ ref: { id: 'h1' } }, { ref: { id: 'h2' } }],
      habit_logs: [{ ref: { id: 'l1' } }],
      streak_status: [{ ref: { id: 's1' } }],
    };

    const userDoc = {
      exists: true,
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const db = {
      batch: jest.fn(() => {
        const operations = [];
        const batch = {
          delete: jest.fn((ref) => operations.push(ref.id)),
          commit: jest.fn().mockResolvedValue(undefined),
        };
        batches.push({ batch, operations });
        return batch;
      }),
      collection: jest.fn((name) => ({
        where: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            docs: docsByCollection[name] || [],
          }),
        })),
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(userDoc),
          delete: userDoc.delete,
        })),
      })),
    };

    return { db, batches, userDoc };
  }

  test('deletes all related documents and auth user', async () => {
    const { db, batches, userDoc } = createDbMock();
    const auth = { deleteUser: jest.fn().mockResolvedValue(undefined) };

    const result = await deleteUserDataCascade('user-123', { db, auth });

    expect(result.success).toBe(true);
    expect(result.deletedDocs).toBe(5);
    expect(auth.deleteUser).toHaveBeenCalledWith('user-123');
    expect(userDoc.delete).toHaveBeenCalledTimes(1);

    const deletedRefs = batches.flatMap((entry) => entry.operations);
    expect(deletedRefs).toEqual(expect.arrayContaining(['h1', 'h2', 'l1', 's1']));
  });

  test('deletes only habit-related data without deleting auth user', async () => {
    const { db, batches, userDoc } = createDbMock();
    const result = await deleteUserHabitData('user-123', { db });

    expect(result.success).toBe(true);
    expect(result.deletedDocs).toBe(4);
    expect(userDoc.delete).not.toHaveBeenCalled();

    const deletedRefs = batches.flatMap((entry) => entry.operations);
    expect(deletedRefs).toEqual(expect.arrayContaining(['h1', 'h2', 'l1', 's1']));
  });

  test('throws when user id is missing', async () => {
    await expect(deleteUserDataCascade('', { db: {}, auth: {} })).rejects.toThrow(
      'userId is required for deletion cascade'
    );
  });

  test('throws when db is missing for habit-only deletion', async () => {
    await expect(deleteUserHabitData('user-123', {})).rejects.toThrow(
      'db dependency is required'
    );
  });
});
