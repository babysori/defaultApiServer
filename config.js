'use strict';

require('module-alias/register');

const config = require('#/config');

const { env } = process;
const raw = {
  common: {
  },

  develop: {
  },

  test: {
  },

  production: {
  },
};

module.exports = Object.assign(config, raw.common, raw[env.NODE_ENV] || {});
