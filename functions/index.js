const api = require('./src/handlers/api');
const triggers = require('./src/handlers/triggers');

module.exports = {
  ...api,
  ...triggers,
};
