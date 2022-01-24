'use strict';

require('module-alias/register');

const router = require('express').Router();
const api = require('@/app/apis').v1.user;
const { asyncWrapper } = require('#/libs/wrapper');
const { auth } = require('@/middleware');

router.get('/', auth, asyncWrapper(api.get));
router.patch('/', auth, asyncWrapper(api.change));
router.get('/detail', auth, asyncWrapper(api.getDetail));

module.exports = router;
