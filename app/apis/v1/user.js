'use strict';

const UserService = require('../../../services/user');

exports.get = async (req, res) => {
  const { owner } = req;

  const user = await UserService.getInfo(owner);

  res.send({
    code: 0,
    result: { user },
  });
};

exports.getDetail = async (req, res) => {
  const { owner } = req;

  const user = await UserService.getDetailInfo(owner);

  res.send({
    code: 0,
    result: { user },
  });
};

exports.change = async (req, res) => {
  const { owner, body } = req;
  const {
    nickname,
  } = body;

  const user = await UserService.getObject(owner);
  await UserService.changeObject(user, { nickname });

  res.send({
    code: 0,
    result: {},
  });
};
