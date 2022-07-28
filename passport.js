'use strict';

const fs = require('fs');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const pubKey = fs.readFileSync(`${__dirname}/.keys/jwtrs256.key.pub`);

function fromCookie(req) {
  return req.cookies.access_token;
}

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([
    fromCookie,
    ExtractJwt.fromBodyField('access_token'),
    ExtractJwt.fromUrlQueryParameter('access_token'),
    ExtractJwt.fromHeader('access_token'),
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: pubKey,
  // issuer: 'defaultserver.com',
  // audience: 'defaultserver.com',
}, (jwt_payload, done) => {
  const { account, user } = jwt_payload;
  const { owner } = user;

  return done(null, { account, user, owner });
}));
