require('dotenv').config();
module.exports = {
  payload: {},
  options: {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE,
    algorithm: process.env.JWT_ALGORITHM,
  },
};
