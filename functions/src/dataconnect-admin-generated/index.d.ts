import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

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

/** Generated Node Admin SDK operation action function for the 'ListMyHabits' Query. Allow users to execute without passing in DataConnect. */
export function listMyHabits(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyHabitsData>>;
/** Generated Node Admin SDK operation action function for the 'ListMyHabits' Query. Allow users to pass in custom DataConnect instances. */
export function listMyHabits(options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyHabitsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateHabit' Mutation. Allow users to execute without passing in DataConnect. */
export function createHabit(dc: DataConnect, vars: CreateHabitVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateHabitData>>;
/** Generated Node Admin SDK operation action function for the 'CreateHabit' Mutation. Allow users to pass in custom DataConnect instances. */
export function createHabit(vars: CreateHabitVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateHabitData>>;

/** Generated Node Admin SDK operation action function for the 'GetHabitLogsForDate' Query. Allow users to execute without passing in DataConnect. */
export function getHabitLogsForDate(dc: DataConnect, vars: GetHabitLogsForDateVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetHabitLogsForDateData>>;
/** Generated Node Admin SDK operation action function for the 'GetHabitLogsForDate' Query. Allow users to pass in custom DataConnect instances. */
export function getHabitLogsForDate(vars: GetHabitLogsForDateVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetHabitLogsForDateData>>;

/** Generated Node Admin SDK operation action function for the 'CompleteHabitLog' Mutation. Allow users to execute without passing in DataConnect. */
export function completeHabitLog(dc: DataConnect, vars: CompleteHabitLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CompleteHabitLogData>>;
/** Generated Node Admin SDK operation action function for the 'CompleteHabitLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function completeHabitLog(vars: CompleteHabitLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CompleteHabitLogData>>;

