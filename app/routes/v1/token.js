'use strict';

require('module-alias/register');

const router = require('express').Router();
const api = require('@/app/apis').v1.token;
const { asyncWrapper } = require('#/libs/wrapper');

router.get('/', asyncWrapper(api.refresh));

module.exports = router;
