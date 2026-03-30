const base = require('./config/eslint-base');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  ...base,
  root: true,
};
