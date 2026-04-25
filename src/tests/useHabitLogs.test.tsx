import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = vi.hoisted(() => ({
  subscribeToHabitLogs: vi.fn(),
  syncHabitLog: vi.fn(),
}));

vi.mock('../services/habitService', () => serviceMock);
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    authState: {
      status: 'authenticated_ready',
      user: { uid: 'user-1', displayName: 'Alex' },
      security: {
        emailVerified: true,
        totpVerified: true,
        isReady: true,
        missingSteps: [],
      },
      profile: {
        id: 'user-1',
        email: 'alex@example.com',
        timezone: 'UTC',
        totp: { enabled: true },
      },
      profileStatus: 'ready',
      message: null,
    },
  }),
}));

describe('useHabitLogs', () => {
  beforeEach(() => {
    serviceMock.subscribeToHabitLogs.mockReset();
    serviceMock.syncHabitLog.mockReset();
  });

  it('loads completion state from subscribed habit logs', async () => {
    serviceMock.subscribeToHabitLogs.mockImplementation(
      (_userId, _startDate, _endDate, onData) => {
        onData([
          {
            id: 'log-1',
            habitId: 'habit-1',
            userId: 'user-1',
            dateString: '2026-04-25',
            completed: true,
            timestamp: new Date('2026-04-25T12:00:00.000Z'),
          },
        ]);
        return vi.fn();
      },
    );

    const { useHabitLogs } = await import('../hooks/useHabitLogs');
    const { result } = renderHook(() =>
      useHabitLogs('user-1', new Date('2026-04-25T12:00:00.000Z')),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completionMap).toEqual({ 'habit-1': true });
  });

  it('optimistically toggles completion and rolls back on sync failure', async () => {
    serviceMock.subscribeToHabitLogs.mockImplementation(
      (_userId, _startDate, _endDate, onData) => {
        onData([
          {
            id: 'log-1',
            habitId: 'habit-1',
            userId: 'user-1',
            dateString: '2026-04-25',
            completed: false,
            timestamp: new Date('2026-04-25T12:00:00.000Z'),
          },
        ]);
        return vi.fn();
      },
    );

    let resolveSync:
      | ((value: { success: boolean; error?: string }) => void)
      | undefined;
    serviceMock.syncHabitLog.mockReturnValue(
      new Promise((resolve) => {
        resolveSync = resolve;
      }),
    );

    const { useHabitLogs } = await import('../hooks/useHabitLogs');
    const { result } = renderHook(() =>
      useHabitLogs('user-1', new Date('2026-04-25T12:00:00.000Z')),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      void result.current.toggleCompletion('habit-1', false);
    });

    expect(result.current.completionMap['habit-1']).toBe(true);

    await act(async () => {
      resolveSync?.({ success: false, error: 'Sync failed.' });
    });

    await waitFor(() => {
      expect(result.current.completionMap['habit-1']).toBe(false);
      expect(result.current.syncError).toBe('Sync failed.');
    });
  });
});
