'use strict';

const passport = require('passport');
const config = require('../../config');
const AuthorizationError = require('../../errors').AuthorizationError;
const User = require('../user');

var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

function PassportService() {
    var self = this;

    var accessTokenJwtStrategyOptions = {
        secretOrKey: config.jwtSecret,
        jwtFromRequest: ExtractJwt.fromExtractors([
            ExtractJwt.fromUrlQueryParameter('accessToken'),
            ExtractJwt.fromBodyField('accessToken'),
            ExtractJwt.fromAuthHeaderWithScheme('Bearer')
        ])
    };

    // Access token strategy validates the access token and returns the user serialized in the payload
    var accessTokenStrategy = new JwtStrategy(accessTokenJwtStrategyOptions, function(jwtPayload, next){
        var user = new User(jwtPayload.user);
        next(null, user);
    });

    passport.use('accessToken', accessTokenStrategy);

    this.authenticate = function authenticate() {
        return passport.authenticate('accessToken', { session: false, failWithError: true })
    };

}

module.exports = new PassportService();