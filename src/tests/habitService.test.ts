import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreMock = vi.hoisted(() => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn((value: number) => ({ type: 'limit', value })),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field: string, direction: string) => ({
    type: 'orderBy',
    field,
    direction,
  })),
  query: vi.fn((...parts: unknown[]) => ({ parts })),
  where: vi.fn((field: string, operator: string, value: unknown) => ({
    type: 'where',
    field,
    operator,
    value,
  })),
}));

const functionsMock = vi.hoisted(() => ({
  httpsCallable: vi.fn(),
}));

const messagingMock = vi.hoisted(() => ({
  onMessage: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestoreMock);
vi.mock('firebase/functions', () => functionsMock);
vi.mock('firebase/messaging', () => messagingMock);
vi.mock('../config/firebase', () => ({
  db: {},
  functions: {},
  messaging: null,
}));

describe('habitService', () => {
  beforeEach(() => {
    vi.resetModules();
    firestoreMock.collection.mockReset();
    firestoreMock.getDocs.mockReset();
    firestoreMock.limit.mockClear();
    firestoreMock.onSnapshot.mockReset();
    firestoreMock.orderBy.mockClear();
    firestoreMock.query.mockClear();
    firestoreMock.where.mockClear();
    functionsMock.httpsCallable.mockReset();
    messagingMock.onMessage.mockReset();
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('maps subscribed habits into frontend habit objects', async () => {
    const unsubscribe = vi.fn();
    firestoreMock.onSnapshot.mockImplementation((_query, onData) => {
      onData({
        docs: [
          {
            id: 'habit-1',
            data: () => ({
              userId: 'user-1',
              name: 'Meditate',
              frequency: { type: 'SPECIFIC_DAYS', days: ['MON', 'WED'] },
              reminders: [],
              archived: false,
              category: 'Mindset',
              uiBgColor: 'bg-[#FDECE8]',
              uiIconName: 'Activity',
              uiMetric: '15 min',
              createdAt: { toDate: () => new Date('2026-04-20T00:00:00.000Z') },
              updatedAt: { toDate: () => new Date('2026-04-21T00:00:00.000Z') },
            }),
          },
        ],
      });

      return unsubscribe;
    });

    const { subscribeToHabits } = await import('../services/habitService');
    const onData = vi.fn();

    const result = subscribeToHabits('user-1', onData, vi.fn());

    expect(result).toBe(unsubscribe);
    expect(onData).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'habit-1',
        name: 'Meditate',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    ]);
  });

  it('maps subscribed habit logs into date objects', async () => {
    firestoreMock.onSnapshot.mockImplementation((_query, onData) => {
      onData({
        docs: [
          {
            id: 'log-1',
            data: () => ({
              habitId: 'habit-1',
              userId: 'user-1',
              dateString: '2026-04-25',
              completed: true,
              timestamp: '2026-04-25T12:00:00.000Z',
            }),
          },
        ],
      });

      return vi.fn();
    });

    const { subscribeToHabitLogs } = await import('../services/habitService');
    const onData = vi.fn();

    subscribeToHabitLogs('user-1', '2026-04-25', '2026-04-25', onData, vi.fn());

    expect(onData).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'log-1',
        timestamp: expect.any(Date),
      }),
    ]);
  });

  it('blocks createHabit while offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });

    const { createHabit } = await import('../services/habitService');
    const result = await createHabit({
      name: 'Read',
      frequency: { type: 'SPECIFIC_DAYS', days: ['MON'] },
    });

    expect(result).toEqual({
      ok: false,
      error:
        'No connection — changes could not be saved. Please retry when online.',
    });
    expect(functionsMock.httpsCallable).not.toHaveBeenCalled();
  });

  it('returns callable success data for createHabit', async () => {
    const callable = vi.fn().mockResolvedValue({
      data: { success: true, habitId: 'habit-99' },
    });
    functionsMock.httpsCallable.mockReturnValue(callable);

    const { createHabit } = await import('../services/habitService');
    const result = await createHabit({
      name: 'Read',
      frequency: { type: 'SPECIFIC_DAYS', days: ['MON'] },
    });

    expect(result).toEqual({ ok: true, habitId: 'habit-99' });
    expect(callable).toHaveBeenCalled();
  });

  it('maps callable failures for updateHabit and archiveHabit', async () => {
    const callable = vi.fn().mockRejectedValue(new Error('functions/unavailable'));
    functionsMock.httpsCallable.mockReturnValue(callable);

    const { updateHabit, archiveHabit } = await import('../services/habitService');

    await expect(
      updateHabit({
        habitId: 'habit-1',
        name: 'Updated',
      }),
    ).resolves.toEqual({
      ok: false,
      error: 'functions/unavailable',
    });

    await expect(archiveHabit('habit-1')).resolves.toEqual({
      ok: false,
      error: 'functions/unavailable',
    });
  });
});
