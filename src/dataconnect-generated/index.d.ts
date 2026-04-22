import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CompleteHabitLogData {
  habitLog_update?: HabitLog_Key | null;
}

export interface CompleteHabitLogVariables {
  id: UUIDString;
  notes?: string | null;
}

export interface CreateHabitData {
  habit_insert: Habit_Key;
}

export interface CreateHabitVariables {
  name: string;
  frequency: string;
  reminderTime?: string | null;
}

export interface GetHabitLogsForDateData {
  habitLogs: ({
    id: UUIDString;
    habit: {
      name: string;
    };
      logDate: DateString;
      isCompleted: boolean;
      notes?: string | null;
  } & HabitLog_Key)[];
}

export interface GetHabitLogsForDateVariables {
  logDate: DateString;
}

export interface HabitLog_Key {
  id: UUIDString;
  __typename?: 'HabitLog_Key';
}

export interface Habit_Key {
  id: UUIDString;
  __typename?: 'Habit_Key';
}

export interface ListMyHabitsData {
  habits: ({
    id: UUIDString;
    name: string;
    frequency: string;
    createdAt: TimestampString;
    reminderTime?: string | null;
  } & Habit_Key)[];
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListMyHabitsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyHabitsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyHabitsData, undefined>;
  operationName: string;
}
export const listMyHabitsRef: ListMyHabitsRef;

export function listMyHabits(options?: ExecuteQueryOptions): QueryPromise<ListMyHabitsData, undefined>;
export function listMyHabits(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyHabitsData, undefined>;

interface CreateHabitRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateHabitVariables): MutationRef<CreateHabitData, CreateHabitVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateHabitVariables): MutationRef<CreateHabitData, CreateHabitVariables>;
  operationName: string;
}
export const createHabitRef: CreateHabitRef;

export function createHabit(vars: CreateHabitVariables): MutationPromise<CreateHabitData, CreateHabitVariables>;
export function createHabit(dc: DataConnect, vars: CreateHabitVariables): MutationPromise<CreateHabitData, CreateHabitVariables>;

interface GetHabitLogsForDateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHabitLogsForDateVariables): QueryRef<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetHabitLogsForDateVariables): QueryRef<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;
  operationName: string;
}
export const getHabitLogsForDateRef: GetHabitLogsForDateRef;

export function getHabitLogsForDate(vars: GetHabitLogsForDateVariables, options?: ExecuteQueryOptions): QueryPromise<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;
export function getHabitLogsForDate(dc: DataConnect, vars: GetHabitLogsForDateVariables, options?: ExecuteQueryOptions): QueryPromise<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;

interface CompleteHabitLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CompleteHabitLogVariables): MutationRef<CompleteHabitLogData, CompleteHabitLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CompleteHabitLogVariables): MutationRef<CompleteHabitLogData, CompleteHabitLogVariables>;
  operationName: string;
}
export const completeHabitLogRef: CompleteHabitLogRef;

export function completeHabitLog(vars: CompleteHabitLogVariables): MutationPromise<CompleteHabitLogData, CompleteHabitLogVariables>;
export function completeHabitLog(dc: DataConnect, vars: CompleteHabitLogVariables): MutationPromise<CompleteHabitLogData, CompleteHabitLogVariables>;

