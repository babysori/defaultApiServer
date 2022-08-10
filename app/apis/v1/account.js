'use strict';

require('module-alias/register');

const config = require('@/config');
const errors = require('#/libs/errors');
// for MySQL
// const { transaction } = require('#/db/sequelize');

const TokenService = require('#/services/token');
const AccountService = require('#/services/account');
const UserService = require('#/services/user');

const { UniqueId } = require('#/libs/util');
const { AccountType } = require('#/constants');

async function verify(type, id, socialIdToken, socialAccessToken) {
  switch (type) {
    case AccountType.UID:
    case AccountType.USERNAME:
      // 인증없음
      break;
    case AccountType.EMAIL:
      // TODO: Email 인증 메일 발송 및 account 인증 field 추가
      break;
    case AccountType.GOOGLE:
      await AccountService.verifyGoogleToken(id, socialIdToken, socialAccessToken);
      break;
    case AccountType.APPLE:
      await AccountService.verifyAppleToken(id, socialAccessToken);
      break;
    case AccountType.FACEBOOK:
      await AccountService.verifyFacebookToken(id, socialAccessToken);
      break;
    case AccountType.KAKAO:
      await AccountService.verifyKakaoToken(id, socialAccessToken);
      break;
    case AccountType.NAVER:
      // TODO: Naver 인증 R&D 후 구현 예정
      // await AccountService.verifyNaverToken(id, socialAccessToken);
      break;
    case AccountType.LINE:
      await AccountService.verifyLineToken(id, socialAccessToken);
      break;
    default:
      throw new errors.NotSupportedYetError('type not matched');
  }
}

exports.create = async (req, res) => {
  const { body } = req;
  const {
    type = AccountType.USERNAME, id, password, name, nickname, socialIdToken, socialAccessToken,
  } = body;
  const result = {};

  if ((type === AccountType.USERNAME || type === AccountType.EMAIL) && !password) {
    throw new errors.InvalidInputError('no password');
  }

  await AccountService.checkDuplication(type, id);
  // TODO: 재가입 여부 확인 및 데이터 복구

  await verify(type, id, socialIdToken, socialAccessToken);

  const owner = UniqueId();

  // for MySQL
  // await transaction(async (t) => {
  //   await Promise.all([
  //     AccountService.createObject({
  //       type, id, password, owner,
  //     }, t),
  //     UserService.createObject({
  //       owner, name, nickname, isTest: config.isQA,
  //     }, t),
  //   ]);
  // });
  // for DynamoDB
  await Promise.all([
    AccountService.createObject({
      type, id, password, owner,
    }),
    UserService.createObject({
      owner, name, nickname, isTest: config.isQA,
    }),
  ]);

  if (type === AccountType.EMAIL) {
    // TODO: authorization Email 발송
  } else {
    const accessToken = TokenService.createAccessToken({
      account: { type },
      user: {
        owner, name, nickname, isTest: config.isQA,
      },
    });
    const refreshToken = await TokenService.createRefreshToken(owner);

    // for Web
    TokenService.setTokenCookie(res, accessToken, refreshToken);

    // for App
    // result.access_token = accessToken;
    // result.refresh_token = refreshToken;
  }

  res.send({
    code: 0,
    result,
  });
};

// TODO: Authorization API 추가해야함.

exports.login = async (req, res) => {
  const { body } = req;
  const { type = AccountType.USERNAME, id, password } = body;
  const result = {};

  const account = await AccountService.getObject(type, id);
  const { owner } = account;
  req.owner = owner;

  if (type === AccountType.USERNAME || type === AccountType.EMAIL) {
    await AccountService.checkPassword(account, password);
  }

  const user = await UserService.getObject(owner);
  const { name, nickname } = user;

  const accessToken = TokenService.createAccessToken({ owner, name, nickname });
  const refreshToken = await TokenService.createRefreshToken(owner);

  // for Web
  TokenService.setTokenCookie(res, accessToken, refreshToken);

  // for App
  // result.access_token = accessToken;
  // result.refresh_token = refreshToken;

  res.send({
    code: 0,
    result,
  });
};

exports.change = async (req, res) => {
  const { owner, body, params } = req;
  const { type, id } = params;
  const {
    password,
  } = body;

  const account = await AccountService.getObject(type, id);
  if (account.owner !== owner) throw new errors.InvalidInputError();
  await AccountService.changeObject(account, { password });

  res.send({
    code: 0,
    result: {},
  });
};

exports.delete = async (req, res) => {
  const { owner } = req;

  // user 정보 백업
  const [accounts, user] = await Promise.all([
    AccountService.getAllObjectsByOwner(owner),
    UserService.getObject(owner),
  ]);
  user.accounts = JSON.stringify(accounts);

  // 관련 정보 삭제 및 account.quit 및 user.quit 등록
  // for MySQL
  // await transaction(async (t) => {
  //   await Promise.all([
  //     AccountService.removeAllObjectsByOwner(owner, accounts, t),
  //     UserService.removeObject(user, t),
  //   ]);
  // });
  // for DynamoDB
  await Promise.all([
    AccountService.removeAllObjectsByOwner(owner, accounts),
    UserService.removeObject(user),
  ]);

  res.clearCookie('access_token');
  res.send({
    code: 0,
    result: {},
  });
};

exports.link = async (req, res) => {
  const { owner, body } = req;
  const {
    type, id, password, socialIdToken, socialAccessToken,
  } = body;

  if ((type === AccountType.USERNAME || type === AccountType.EMAIL) && !password) {
    throw new errors.InvalidInputError('no password');
  }

  await AccountService.checkDuplicationByOwner(type, owner);
  // TODO: 다른 User 존재시 처리 및 탈퇴한 계정 처리

  await verify(type, id, socialIdToken, socialAccessToken);
  await AccountService.createObject({
    type, id, password, owner,
  });

  res.send({
    code: 0,
    result: {},
  });
};
