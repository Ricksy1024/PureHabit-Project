const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'purehabit-project',
  location: 'europe-central2'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const listMyHabitsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyHabits');
}
listMyHabitsRef.operationName = 'ListMyHabits';
exports.listMyHabitsRef = listMyHabitsRef;

exports.listMyHabits = function listMyHabits(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listMyHabitsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createHabitRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateHabit', inputVars);
}
createHabitRef.operationName = 'CreateHabit';
exports.createHabitRef = createHabitRef;

exports.createHabit = function createHabit(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createHabitRef(dcInstance, inputVars));
}
;

const getHabitLogsForDateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHabitLogsForDate', inputVars);
}
getHabitLogsForDateRef.operationName = 'GetHabitLogsForDate';
exports.getHabitLogsForDateRef = getHabitLogsForDateRef;

exports.getHabitLogsForDate = function getHabitLogsForDate(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getHabitLogsForDateRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const completeHabitLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CompleteHabitLog', inputVars);
}
completeHabitLogRef.operationName = 'CompleteHabitLog';
exports.completeHabitLogRef = completeHabitLogRef;

exports.completeHabitLog = function completeHabitLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(completeHabitLogRef(dcInstance, inputVars));
}
;
