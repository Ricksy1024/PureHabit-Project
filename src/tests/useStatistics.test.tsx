import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = vi.hoisted(() => ({
  subscribeToHabitLogs: vi.fn(),
  subscribeToHabits: vi.fn(),
}));

vi.mock('../services/habitService', () => serviceMock);

describe('useStatistics', () => {
  beforeEach(() => {
    serviceMock.subscribeToHabitLogs.mockReset();
    serviceMock.subscribeToHabits.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not refetch when rerendered with equivalent date values', async () => {
    serviceMock.subscribeToHabitLogs.mockImplementation(
      (_userId, _startDate, _endDate, onData) => {
        onData([]);
        return vi.fn();
      },
    );
    serviceMock.subscribeToHabits.mockImplementation((_userId, onData) => {
      onData([]);
      return vi.fn();
    });

    const { useStatistics } = await import('../hooks/useStatistics');
    const { result, rerender } = renderHook(
      ({ startDate, endDate }) => useStatistics('user-1', startDate, endDate),
      {
        initialProps: {
          startDate: new Date('2026-04-21T12:00:00.000Z'),
          endDate: new Date('2026-04-27T12:00:00.000Z'),
        },
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(serviceMock.subscribeToHabitLogs).toHaveBeenCalledTimes(1);
    expect(serviceMock.subscribeToHabits).toHaveBeenCalledTimes(1);

    rerender({
      startDate: new Date('2026-04-21T12:00:00.000Z'),
      endDate: new Date('2026-04-27T12:00:00.000Z'),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(serviceMock.subscribeToHabitLogs).toHaveBeenCalledTimes(1);
    expect(serviceMock.subscribeToHabits).toHaveBeenCalledTimes(1);
  });

  it('uses logical day strings for the requested statistics range', async () => {
    serviceMock.subscribeToHabitLogs.mockImplementation(
      (_userId, _startDate, _endDate, onData) => {
        onData([]);
        return vi.fn();
      },
    );
    serviceMock.subscribeToHabits.mockImplementation((_userId, onData) => {
      onData([]);
      return vi.fn();
    });

    const { useStatistics } = await import('../hooks/useStatistics');
    const { result } = renderHook(() =>
      useStatistics(
        'user-1',
        new Date('2026-04-21T00:00:00.000Z'),
        new Date('2026-04-21T00:00:00.000Z'),
        'UTC',
      ),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(serviceMock.subscribeToHabitLogs).toHaveBeenCalledWith(
      'user-1',
      '2026-04-21',
      '2026-04-21',
      expect.any(Function),
      expect.any(Function),
    );
  });

  it('surfaces a timeout when statistics never resolve', async () => {
    vi.useFakeTimers();
    serviceMock.subscribeToHabitLogs.mockReturnValue(vi.fn());
    serviceMock.subscribeToHabits.mockReturnValue(vi.fn());

    const { useStatistics } = await import('../hooks/useStatistics');
    const { result } = renderHook(() =>
      useStatistics(
        'user-1',
        new Date('2026-04-21T12:00:00.000Z'),
        new Date('2026-04-27T12:00:00.000Z'),
      ),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      'Loading timeout. Please check your connection or retry.',
    );
  });

  it('updates statistics when the live log subscription changes', async () => {
    let pushLogs:
      | ((logs: Array<{
          id: string;
          habitId: string;
          userId: string;
          dateString: string;
          completed: boolean;
          timestamp: Date;
        }>) => void)
      | undefined;

    serviceMock.subscribeToHabitLogs.mockImplementation(
      (_userId, _startDate, _endDate, onData) => {
        pushLogs = onData;
        onData([]);
        return vi.fn();
      },
    );
    serviceMock.subscribeToHabits.mockImplementation((_userId, onData) => {
      onData([
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Read',
          frequency: { type: 'SPECIFIC_DAYS', days: ['MON', 'TUE'] },
          reminders: [],
          archived: false,
          category: 'Learning',
          uiBgColor: 'bg-[#FDECE8]',
          uiIconName: 'Book',
          uiMetric: '20 min',
          createdAt: new Date('2026-04-20T00:00:00.000Z'),
          updatedAt: new Date('2026-04-21T00:00:00.000Z'),
        },
      ]);
      return vi.fn();
    });

    const { useStatistics } = await import('../hooks/useStatistics');
    const { result } = renderHook(() =>
      useStatistics(
        'user-1',
        new Date('2026-04-20T12:00:00.000Z'),
        new Date('2026-04-21T12:00:00.000Z'),
      ),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats.completedCount).toBe(0);
    expect(result.current.stats.completionRate).toBe(0);

    await act(async () => {
      pushLogs?.([
        {
          id: 'log-1',
          habitId: 'habit-1',
          userId: 'user-1',
          dateString: '2026-04-21',
          completed: true,
          timestamp: new Date('2026-04-21T12:00:00.000Z'),
        },
      ]);
    });

    await waitFor(() => {
      expect(result.current.stats.completedCount).toBe(1);
    });

    expect(result.current.stats.completionRate).toBe(50);
    expect(result.current.stats.logsByDate['2026-04-21']).toEqual({
      'habit-1': true,
    });
  });
});
