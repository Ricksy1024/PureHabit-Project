import { ListMyHabitsData, CreateHabitData, CreateHabitVariables, GetHabitLogsForDateData, GetHabitLogsForDateVariables, CompleteHabitLogData, CompleteHabitLogVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListMyHabits(options?: useDataConnectQueryOptions<ListMyHabitsData>): UseDataConnectQueryResult<ListMyHabitsData, undefined>;
export function useListMyHabits(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyHabitsData>): UseDataConnectQueryResult<ListMyHabitsData, undefined>;

export function useCreateHabit(options?: useDataConnectMutationOptions<CreateHabitData, FirebaseError, CreateHabitVariables>): UseDataConnectMutationResult<CreateHabitData, CreateHabitVariables>;
export function useCreateHabit(dc: DataConnect, options?: useDataConnectMutationOptions<CreateHabitData, FirebaseError, CreateHabitVariables>): UseDataConnectMutationResult<CreateHabitData, CreateHabitVariables>;

export function useGetHabitLogsForDate(vars: GetHabitLogsForDateVariables, options?: useDataConnectQueryOptions<GetHabitLogsForDateData>): UseDataConnectQueryResult<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;
export function useGetHabitLogsForDate(dc: DataConnect, vars: GetHabitLogsForDateVariables, options?: useDataConnectQueryOptions<GetHabitLogsForDateData>): UseDataConnectQueryResult<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;

export function useCompleteHabitLog(options?: useDataConnectMutationOptions<CompleteHabitLogData, FirebaseError, CompleteHabitLogVariables>): UseDataConnectMutationResult<CompleteHabitLogData, CompleteHabitLogVariables>;
export function useCompleteHabitLog(dc: DataConnect, options?: useDataConnectMutationOptions<CompleteHabitLogData, FirebaseError, CompleteHabitLogVariables>): UseDataConnectMutationResult<CompleteHabitLogData, CompleteHabitLogVariables>;
