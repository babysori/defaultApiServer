'use strict';

const cluster = require('cluster');
const os = require('os');

require('module-alias/register');

const config = require('@/config');
const logger = require('#/libs/logger');
const { sequelize } = require('#/db/sequelize_model');
const dynamodb = require('#/db/dynamodb_schema');
const { getDateString } = require('#/libs/util');

const count = os.cpus().length;

if (cluster.isMaster) {
  logger.fatal(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.fatal(`CPU core count: ${count}`);
  logger.fatal(`Begin: ${getDateString()}`);
}

const workers = {};
function spawn() {
  const worker = cluster.fork();
  workers[worker.pid] = worker;
  return worker;
}

if (config.clustering === true && cluster.isMaster) {
  if (config.makeTable) {
    sequelize.sync();
    dynamodb.sync();
  }

  for (let i = 0; i < count; i += 1) spawn();

  cluster.on('death', (worker) => {
    logger.info(`worker ${worker.pid} died.`);
    logger.info('spawning a new process..');
    spawn();
  });
} else {
  if (config.makeTable) {
    sequelize.sync();
    dynamodb.sync();
  }

  require('./server'); // eslint-disable-line global-require
}
