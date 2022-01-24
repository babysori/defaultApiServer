'use strict';

require('module-alias/register');

const router = require('express').Router();
const api = require('@/app/apis').v1.account;
const { asyncWrapper } = require('#/libs/wrapper');
const { auth } = require('@/middleware');

router.post('/', asyncWrapper(api.create));
router.put('/', asyncWrapper(api.login));
router.patch('/:type/:id', auth, asyncWrapper(api.change));
router.delete('/', auth, asyncWrapper(api.delete));
router.post('/link', auth, asyncWrapper(api.link));

module.exports = router;
