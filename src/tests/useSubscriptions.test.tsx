import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = vi.hoisted(() => ({
  subscribeToHabits: vi.fn(),
  subscribeToStreaks: vi.fn(),
}));

vi.mock('../services/habitService', () => serviceMock);

describe('habit subscription hooks', () => {
  beforeEach(() => {
    serviceMock.subscribeToHabits.mockReset();
    serviceMock.subscribeToStreaks.mockReset();
  });

  it('useHabits transitions from loading to data and cleans up the subscription', async () => {
    const unsubscribe = vi.fn();

    serviceMock.subscribeToHabits.mockImplementation((_userId, onData) => {
      queueMicrotask(() => {
        onData([
          {
            id: 'habit-1',
            userId: 'user-1',
            name: 'Read',
            frequency: { type: 'SPECIFIC_DAYS', days: ['MON'] },
            reminders: [],
            archived: false,
            category: 'Learning',
            uiBgColor: 'bg-[#FDECE8]',
            uiIconName: 'Book',
            uiMetric: '20 min',
            createdAt: { toDate: () => new Date('2026-04-20T00:00:00.000Z') },
            updatedAt: { toDate: () => new Date('2026-04-21T00:00:00.000Z') },
          },
        ]);
      });

      return unsubscribe;
    });

    const { useHabits } = await import('../hooks/useHabits');
    const { result, unmount } = renderHook(() => useHabits('user-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.habits[0].createdAt).toBeInstanceOf(Date);

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('useStreaks transitions from loading to error and cleans up the subscription', async () => {
    const unsubscribe = vi.fn();

    serviceMock.subscribeToStreaks.mockImplementation(
      (_userId, _onData, onError) => {
        onError(new Error('permission-denied'));
        return unsubscribe;
      },
    );

    const { useStreaks } = await import('../hooks/useStreaks');
    const { result, unmount } = renderHook(() => useStreaks('user-1', ['habit-1']));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('permission-denied');

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
