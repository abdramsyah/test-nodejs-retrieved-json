'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function generateToken(payload, secret_key, time) {
  // const token = jwt.sign(payload, secret_key, `{ expiresIn: time })
  console.log(jwtConfig.options);
  const token = jwt.sign(payload, secret_key, jwtConfig.options);
  console.log('[LOG: TOKEN] 1.0', jwtConfig.options);
  return token;
}

function cekToken(token, secret_key) {
  return jwt.decode(token, secret_key);
}

function verify(token) {
  try {
    return jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      jwtConfig.options
    );
  } catch (error) {
    return false;
  }
}

function decode(token) {
  return jwt.decode(token, { complete: true });
}

function defaultPassword() {
  const strPass = 'deF4uLtP4sswd';
  return hashPassword(strPass);
}

// function isTokenExpired(token) {
//     const decodedToken = jwt.decode(token, { complete: true });

//     if (decodedToken.payload.exp) {
//       const expirationTime = decodedToken.payload.exp * 1000; // Mengonversi waktu kadaluarsa menjadi milidetik
//       const currentTime = Date.now(); // Mendapatkan waktu saat ini dalam milidetik

//       return currentTime > expirationTime; // Membandingkan waktu saat ini dengan waktu kadaluarsa
//     }

//     return false; // Jika waktu kadaluarsa tidak tercantum dalam token, mengembalikan false
//   }

function getPagination(page, size) {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  return { limit, offset };
}

function getPagingData(list, page, limit) {
  const totalItems = list.count;
  const data = list.rows;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, data, totalPages, currentPage };
}

function hashPassword(plainPassword) {
  const salt = bcrypt.genSaltSync(5);
  const hash = bcrypt.hashSync(plainPassword, salt);
  return hash;
}

function comparePassword(plainPassword, dbPassword) {
  return bcrypt.compareSync(plainPassword, dbPassword);
}

function AddMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
module.exports = {
  getPagination,
  getPagingData,
  hashPassword,
  comparePassword,
  generateToken,
  cekToken,
  verify,
  decode,
  // isTokenExpired,
  defaultPassword,
  AddMinutesToDate,
};
