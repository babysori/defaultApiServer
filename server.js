'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');

const config = require('./config');
const logger = require('./libs/logger');
const middleware = require('./middleware');
const { sequelize } = require('./db/sequelize_model');
// const dynamodb = require('./db/dynamodb_schema');
// require('./db/mongoose_model');

if (process.mainModule.filename.endsWith('server.js') && config.makeTable) {
  sequelize.sync();
  // dynamodb.sync();
}

const app = express();
const port = process.env.PORT || 4000;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(methodOverride());

require('./passport');
app.use(passport.initialize());

app.enable('trust proxy');

app.use(middleware.clientIp);
app.use(middleware.logBase);

require('./app/routes')(app);

app.use(middleware.actionLog);
app.use(middleware.handleError);

exports.server = app.listen(port, () => {
  logger.error(`Express server started at ${port}`);
});
exports.app = app;
