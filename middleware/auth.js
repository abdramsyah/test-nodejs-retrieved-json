const { outputParser } = require('../utils/outputParser');
const { Users } = require('../models');
const { verify, decode } = require('./../helpers/generalHelpers');

class AuthService {
  static async validateAuthorizationHeader(authorizationHeader) {
    if (!authorizationHeader) {
      throw new Error('Authorization header not found');
    }

    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new Error('Authorization header has bad format');
    }

    const decoded = decode(tokenParts[1]);
    if (!decoded || !verify(tokenParts[1])) {
      throw new Error('Invalid JWT token');
    }

    return decoded;
  }

  static async updateUserLoginStatus(email) {
    await Users.update({ is_login: false }, { where: { email } });
  }

  static async Auth(req, res, next) {
    try {
      console.log('[LOG: MASUK AUTH]');
      const authorizationHeader = req.headers.authorization;

      try {
        const decoded = await AuthService.validateAuthorizationHeader(authorizationHeader);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.payload.iss !== 'Grosri') {
          return outputParser.unauthorized(req, res, 'Request Tidak Valid', 'Invalid token');
        }

        if (now > decoded.payload.exp) {
          await AuthService.updateUserLoginStatus(decoded.payload.email);
          return outputParser.restricted(
            req,
            res,
            'Kamu sudah keluar, silahkan login kembali',
            'JWT Token expired'
          );
        }

        req.payload = decoded.payload;
        req.token = authorizationHeader.split(' ')[1];
        next();
      } catch (error) {
        return outputParser.unauthorized(req, res, 'Request Tidak Valid', error.message);
      }
    } catch (err) {
      return outputParser.internalServerError(req, res, err, 'authorisasi token', 'authMiddleware');
    }
  }
}

module.exports = {
  AuthService,
};
