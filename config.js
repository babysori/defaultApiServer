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
  },

  production: {
  },
};

if (env.CORS_ORIGINS) {
  raw.common.origins = env.CORS_ORIGINS.split('|');
}

module.exports = Object.assign(config, raw.common, raw[env.NODE_ENV] || {});
