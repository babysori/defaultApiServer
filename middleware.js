'use strict';

const passport = require('passport');
const url = require('url');

require('module-alias/register');

const config = require('@/config');

const errors = require('#/libs/errors');
const logger = require('#/libs/logger');
const { isEmpty } = require('#/libs/util');

const LogDB = require('#/libs/db_client/mongo')(config.logDb);

exports.auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, result) => {
    if (!result) return next(new errors.InvalidAccessTokenError());

    const { owner } = result;
    req.owner = owner;
    next();
  })(req, res, next);
};

exports.passActionLog = (req, res, next) => {
  res.logBase.pass = true;

  next();
};

exports.clientIp = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  req.clientIp = (ip === '::1' ? '127.0.0.1' : ip);
  next();
};

exports.logBase = (req, res, next) => {
  const {
    clientIp, method, query, params, body,
  } = req;
  const log = {
    clientIp,
    url: url.parse(req.originalUrl).pathname,
    method,
  };

  if (!isEmpty(body)) log.body = { ...body };
  if (!isEmpty(params)) log.params = { ...params };
  if (!isEmpty(query)) log.query = { ...query };

  res.logBase = log;

  const { send, json } = res;
  res.send = function newSend(obj) {
    if (!obj.code && !isEmpty(obj.changed)) {
      res.logBase.changed = obj.changed;
    }
    send.call(this, obj);
  };
  res.json = function newJson(obj) {
    if (!obj.code && !isEmpty(obj.changed)) {
      res.logBase.changed = obj.changed;
    }
    json.call(this, obj);
  };

  next();
};

exports.actionLog = async (req, res, next) => {
  const { owner } = req;
  const { logBase } = res;

  if (logBase.pass) return next();

  logBase.owner = owner;
  logBase.created = Date.now();

  try {
    await LogDB.put('action', logBase);
  } catch (e) {
    logger.error(e);
  }

  next();
};

const makeFatalErrorLog = (err) => {
  const log = {};

  if (err.message) {
    Object.assign(log, errors.getCodeName(err));
    log.message = err.message;
  }

  if (err.stack) log.stacks = err.stack.split('\n');
  if (err.tableName) log.tableName = err.tableName;
  if (err.origin) log.origin = makeFatalErrorLog(err.origin);

  return log;
};

exports.handleError = async (err, req, res, next) => {
  if (req.req) req = req.req; // eslint-disable-line prefer-destructuring
  const { owner } = req;
  const { logBase } = res;

  logBase.owner = owner || 'UNKNOWN';
  logBase.created = Date.now();

  const detail = errors.getCodeName(err);
  const { code } = detail;

  if (!res.headersSent) {
    res.code = code;
    res.send({ code });
  }

  if (errors.checkCommon(code)) {
    logBase.type = 'COMMON';
    Object.assign(logBase, detail);
  } else {
    logBase.type = 'FATAL';
    Object.assign(logBase, makeFatalErrorLog(err));
  }

  try {
    await LogDB.put('error', logBase);
  } catch (e) {
    logger.error(e);
  }
  if (process.env.NODE_ENV !== 'production') logger.error(logBase);

  next();
};
