'use strict';

const fs = require('fs');
const path = require('path');

const collectDir = (dir, exp) => {
  fs.readdirSync(dir).forEach((f) => {
    if (f === 'index.js') return;

    const fullPath = `${dir}/${f}`;

    if (path.extname(f) === '.js') {
      const fileName = path.basename(f, '.js');

      exp[fileName] = require(fullPath); // eslint-disable-line global-require
    } else if (fs.lstatSync(fullPath).isDirectory()) {
      exp[f] = {};

      collectDir(fullPath, exp[f]);
    }
  });
};

collectDir(__dirname, exports);
