'use strict';

const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  app.use('/', require('./root')); // eslint-disable-line global-require

  const versionList = ['/v1/'];

  versionList.forEach((v) => {
    fs.readdirSync(`${__dirname}${v}`).forEach((f) => {
      if (path.extname(f) === '.js') {
        app.use(v + path.basename(f, '.js'), require(`${__dirname}${v}${f}`)); // eslint-disable-line global-require
      }
    });
  });
};
