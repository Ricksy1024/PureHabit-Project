# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListMyHabits*](#listmyhabits)
  - [*GetHabitLogsForDate*](#gethabitlogsfordate)
- [**Mutations**](#mutations)
  - [*CreateHabit*](#createhabit)
  - [*CompleteHabitLog*](#completehabitlog)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListMyHabits
You can execute the `ListMyHabits` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyHabits(options?: ExecuteQueryOptions): QueryPromise<ListMyHabitsData, undefined>;

interface ListMyHabitsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyHabitsData, undefined>;
}
export const listMyHabitsRef: ListMyHabitsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyHabits(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyHabitsData, undefined>;

interface ListMyHabitsRef {
  ...
  (dc: DataConnect): QueryRef<ListMyHabitsData, undefined>;
}
export const listMyHabitsRef: ListMyHabitsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyHabitsRef:
```typescript
const name = listMyHabitsRef.operationName;
console.log(name);
```

### Variables
The `ListMyHabits` query has no variables.
### Return Type
Recall that executing the `ListMyHabits` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyHabitsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyHabitsData {
  habits: ({
    id: UUIDString;
    name: string;
    frequency: string;
    createdAt: TimestampString;
    reminderTime?: string | null;
  } & Habit_Key)[];
}
```
### Using `ListMyHabits`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyHabits } from '@dataconnect/generated';


// Call the `listMyHabits()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyHabits();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyHabits(dataConnect);

console.log(data.habits);

// Or, you can use the `Promise` API.
listMyHabits().then((response) => {
  const data = response.data;
  console.log(data.habits);
});
```

### Using `ListMyHabits`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyHabitsRef } from '@dataconnect/generated';


// Call the `listMyHabitsRef()` function to get a reference to the query.
const ref = listMyHabitsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyHabitsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.habits);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.habits);
});
```

## GetHabitLogsForDate
You can execute the `GetHabitLogsForDate` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getHabitLogsForDate(vars: GetHabitLogsForDateVariables, options?: ExecuteQueryOptions): QueryPromise<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;

interface GetHabitLogsForDateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHabitLogsForDateVariables): QueryRef<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;
}
export const getHabitLogsForDateRef: GetHabitLogsForDateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getHabitLogsForDate(dc: DataConnect, vars: GetHabitLogsForDateVariables, options?: ExecuteQueryOptions): QueryPromise<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;

interface GetHabitLogsForDateRef {
  ...
  (dc: DataConnect, vars: GetHabitLogsForDateVariables): QueryRef<GetHabitLogsForDateData, GetHabitLogsForDateVariables>;
}
export const getHabitLogsForDateRef: GetHabitLogsForDateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getHabitLogsForDateRef:
```typescript
const name = getHabitLogsForDateRef.operationName;
console.log(name);
```

### Variables
The `GetHabitLogsForDate` query requires an argument of type `GetHabitLogsForDateVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetHabitLogsForDateVariables {
  logDate: DateString;
}
```
### Return Type
Recall that executing the `GetHabitLogsForDate` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetHabitLogsForDateData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetHabitLogsForDate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getHabitLogsForDate, GetHabitLogsForDateVariables } from '@dataconnect/generated';

// The `GetHabitLogsForDate` query requires an argument of type `GetHabitLogsForDateVariables`:
const getHabitLogsForDateVars: GetHabitLogsForDateVariables = {
  logDate: ..., 
};

// Call the `getHabitLogsForDate()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getHabitLogsForDate(getHabitLogsForDateVars);
// Variables can be defined inline as well.
const { data } = await getHabitLogsForDate({ logDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getHabitLogsForDate(dataConnect, getHabitLogsForDateVars);

console.log(data.habitLogs);

// Or, you can use the `Promise` API.
getHabitLogsForDate(getHabitLogsForDateVars).then((response) => {
  const data = response.data;
  console.log(data.habitLogs);
});
```

### Using `GetHabitLogsForDate`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getHabitLogsForDateRef, GetHabitLogsForDateVariables } from '@dataconnect/generated';

// The `GetHabitLogsForDate` query requires an argument of type `GetHabitLogsForDateVariables`:
const getHabitLogsForDateVars: GetHabitLogsForDateVariables = {
  logDate: ..., 
};

// Call the `getHabitLogsForDateRef()` function to get a reference to the query.
const ref = getHabitLogsForDateRef(getHabitLogsForDateVars);
// Variables can be defined inline as well.
const ref = getHabitLogsForDateRef({ logDate: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getHabitLogsForDateRef(dataConnect, getHabitLogsForDateVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.habitLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.habitLogs);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateHabit
You can execute the `CreateHabit` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createHabit(vars: CreateHabitVariables): MutationPromise<CreateHabitData, CreateHabitVariables>;

interface CreateHabitRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateHabitVariables): MutationRef<CreateHabitData, CreateHabitVariables>;
}
export const createHabitRef: CreateHabitRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createHabit(dc: DataConnect, vars: CreateHabitVariables): MutationPromise<CreateHabitData, CreateHabitVariables>;

interface CreateHabitRef {
  ...
  (dc: DataConnect, vars: CreateHabitVariables): MutationRef<CreateHabitData, CreateHabitVariables>;
}
export const createHabitRef: CreateHabitRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createHabitRef:
```typescript
const name = createHabitRef.operationName;
console.log(name);
```

### Variables
The `CreateHabit` mutation requires an argument of type `CreateHabitVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateHabitVariables {
  name: string;
  frequency: string;
  reminderTime?: string | null;
}
```
### Return Type
Recall that executing the `CreateHabit` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateHabitData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateHabitData {
  habit_insert: Habit_Key;
}
```
### Using `CreateHabit`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createHabit, CreateHabitVariables } from '@dataconnect/generated';

// The `CreateHabit` mutation requires an argument of type `CreateHabitVariables`:
const createHabitVars: CreateHabitVariables = {
  name: ..., 
  frequency: ..., 
  reminderTime: ..., // optional
};

// Call the `createHabit()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createHabit(createHabitVars);
// Variables can be defined inline as well.
const { data } = await createHabit({ name: ..., frequency: ..., reminderTime: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createHabit(dataConnect, createHabitVars);

console.log(data.habit_insert);

// Or, you can use the `Promise` API.
createHabit(createHabitVars).then((response) => {
  const data = response.data;
  console.log(data.habit_insert);
});
```

### Using `CreateHabit`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createHabitRef, CreateHabitVariables } from '@dataconnect/generated';

// The `CreateHabit` mutation requires an argument of type `CreateHabitVariables`:
const createHabitVars: CreateHabitVariables = {
  name: ..., 
  frequency: ..., 
  reminderTime: ..., // optional
};

// Call the `createHabitRef()` function to get a reference to the mutation.
const ref = createHabitRef(createHabitVars);
// Variables can be defined inline as well.
const ref = createHabitRef({ name: ..., frequency: ..., reminderTime: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createHabitRef(dataConnect, createHabitVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.habit_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.habit_insert);
});
```

## CompleteHabitLog
You can execute the `CompleteHabitLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
completeHabitLog(vars: CompleteHabitLogVariables): MutationPromise<CompleteHabitLogData, CompleteHabitLogVariables>;

interface CompleteHabitLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CompleteHabitLogVariables): MutationRef<CompleteHabitLogData, CompleteHabitLogVariables>;
}
export const completeHabitLogRef: CompleteHabitLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
completeHabitLog(dc: DataConnect, vars: CompleteHabitLogVariables): MutationPromise<CompleteHabitLogData, CompleteHabitLogVariables>;

interface CompleteHabitLogRef {
  ...
  (dc: DataConnect, vars: CompleteHabitLogVariables): MutationRef<CompleteHabitLogData, CompleteHabitLogVariables>;
}
export const completeHabitLogRef: CompleteHabitLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the completeHabitLogRef:
```typescript
const name = completeHabitLogRef.operationName;
console.log(name);
```

### Variables
The `CompleteHabitLog` mutation requires an argument of type `CompleteHabitLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CompleteHabitLogVariables {
  id: UUIDString;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `CompleteHabitLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CompleteHabitLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CompleteHabitLogData {
  habitLog_update?: HabitLog_Key | null;
}
```
### Using `CompleteHabitLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, completeHabitLog, CompleteHabitLogVariables } from '@dataconnect/generated';

// The `CompleteHabitLog` mutation requires an argument of type `CompleteHabitLogVariables`:
const completeHabitLogVars: CompleteHabitLogVariables = {
  id: ..., 
  notes: ..., // optional
};

// Call the `completeHabitLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await completeHabitLog(completeHabitLogVars);
// Variables can be defined inline as well.
const { data } = await completeHabitLog({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await completeHabitLog(dataConnect, completeHabitLogVars);

console.log(data.habitLog_update);

// Or, you can use the `Promise` API.
completeHabitLog(completeHabitLogVars).then((response) => {
  const data = response.data;
  console.log(data.habitLog_update);
});
```

### Using `CompleteHabitLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, completeHabitLogRef, CompleteHabitLogVariables } from '@dataconnect/generated';

// The `CompleteHabitLog` mutation requires an argument of type `CompleteHabitLogVariables`:
const completeHabitLogVars: CompleteHabitLogVariables = {
  id: ..., 
  notes: ..., // optional
};

// Call the `completeHabitLogRef()` function to get a reference to the mutation.
const ref = completeHabitLogRef(completeHabitLogVars);
// Variables can be defined inline as well.
const ref = completeHabitLogRef({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = completeHabitLogRef(dataConnect, completeHabitLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.habitLog_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.habitLog_update);
});
```

