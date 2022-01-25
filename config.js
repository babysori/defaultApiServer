'use strict';

require('module-alias/register');

const config = require('#/config');

const { env } = process;
const raw = {
  common: {
    origins: [],
  },

  develop: {
  },

  test: {
    origins: ['test.domain'],
  },

  production: {
    origins: ['prod.domain'],
  },
};

module.exports = Object.assign(config, raw.common, raw[env.NODE_ENV] || {});
