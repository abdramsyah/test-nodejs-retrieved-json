'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');

const jwtConfig = require('../config/jwt');

class JwtService {

    constructor() { }

    sign(payload) {
        return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, jwtConfig.options);
    }

    verify(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, jwtConfig.options);
        } catch (error) {
            return false;
        }
    }

    decode(token) {
        return jwt.decode(token, { complete: true });
    }

}

module.exports = new JwtService();