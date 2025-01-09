const Log = require('../utils/logger');
function errorHandler(err, req, res) {
  let code = 500;
  let message = 'Internal Server Error';
  if (err.name === 'SequelizeValidationError') {
    code = 400;
    message = [];
    err.errors.forEach((el) => {
      message.push(el.message);
    });
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    code = 400;
    message = 'This Email has been Taken, try another one';
  } else if (err.name === 'InvalidInput') {
    code = 400;
    message = 'Input Tidak boleh kosong!';
  } else if (err.name === 'InvalidEmailOrPassword') {
    code = 401;
    message = 'Invalid Email or Password';
  } else if (err.name === 'InvalidEmail') {
    code = 401;
    message = 'Invalid Email';
  } else if (err.name === 'InvalidPassword') {
    code = 401;
    message = 'Password Salah';
  } else if (err.name === 'RefreshTokenIsRequired') {
    code = 403;
    message = 'Refresh Token is required!';
  } else if (err.name === 'RefreshTokenIsNotInDatabase') {
    code = 403;
    message = 'Refresh token is not in database!';
  } else if (err.name === 'JWTExpired') {
    code = 403;
    message = 'Refresh token JWT has Expired';
  } else if (err.name === 'EmailOrTypeCannotBeNull') {
    code = 400;
    message = 'Email or Password is required';
  } else if (err.name === 'InvalidReffrehToken') {
    code = 400;
    message = 'Token Required';
  } else if (err.name === 'InvalidFullName') {
    code = 400;
    message = 'Nama tidak boleh mengandung Sibol, Angka, minimal 5 huruf';
  } else if (err.name === 'OTPDoesntMatch') {
    code = 400;
    message = 'OTP Tidak Valid';
  } else if (err.name === 'NotLoginYet') {
    code = 401;
    message = 'Please Login First';
  } else if (err.name === 'PleaseLoginAgain') {
    code = 401;
    message = 'Please Login Again';
  } else if (err.name === 'JsonWebTokenError') {
    code = 401;
    message = 'Invalid Email Or Password';
  } else if (err.name === 'EmailOrPasswordCannotBeNull') {
    code = 400;
    message = 'Email or Password is required';
  } else if (err.name === 'UserNotFound') {
    code = 404;
    message = 'User Not Found';
  } else if (err.name === 'InvalidInputFormat') {
    code = 403;
    message = 'Format document tidak sesuai!';
  } else if (err.name === 'gagalrequest') {
    code = 500;
    message = 'Gagal Request';
  }
  console.log(code, message);
  Log(err, `Error in ${err.function}`);
  return res.status(code).send({
    success: false,
    message_client: `Gagal ${message}, silahkan coba lagi`,
    data: null,
  });
}

module.exports = { errorHandler };
