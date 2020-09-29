const data = require('./metadata.json');

module.exports = {
  root: data.productionMode ? data.root : '..',
};
