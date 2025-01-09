const {
  generateToken,
  comparePassword,
  cekToken,
  hashPassword,
  AddMinutesToDate,
} = require('../../../helpers/generalHelpers');
const { Users, Token, OTP, ResetPassword, LimitOtp, UserLogins } = require('../../../models');
const { setLimitOtp } = require('../../../service/limitKodeOtp');
const { setVerifiedKode } = require('../../../service/sendKodeOtp');
const { Log } = require('../../../utils/customLog');
const { outputParser } = require('../../../utils/outputParser');
const { MESSAGE, STATUS } = require('./../../../config/constant');
const nodemailer = require('nodemailer');
class OauthController {
  static async login(req, res, next) {
    console.log('[LOG]: Login');
    const { email, password, device_id } = req.body;
    try {
      const person = await Users.findOne({
        where: {
          email,
          // role: constant.ROLES.KARYAWAN,
          status: STATUS.ACTIVE,
        },
      });
      if (!person) {
        return outputParser.notFound(req, res, MESSAGE.EMAIL_NOT_FOUND);
      } else {
        if (person.is_verify == false) {
          return outputParser.conflict(req, res, MESSAGE.VERIFICATION_NOT_COMPLETED_MESSAGE);
        }
        const match = comparePassword(password, person.password);
        if (!match) {
          return outputParser.errorCustom(req, res);
        }

        const findDeviceID = await UserLogins.findOne({
          where: {
            user_id: person.id,
            is_login: true,
          },
        });

        if (findDeviceID) {
          return outputParser.conflict(req, res, 'Duplicate Account detected');
        }

        const payload = {
          id: person.id,
          full_name: person.full_name,
          email: person.email,
          device_id,
        };

        let date = Date.now();
        const access_token = generateToken(
          payload,
          process.env.JWT_ACCESS_TOKEN_SECRET,
          process.env.JWT_ACCESS_TOKEN_EXPIRE
        );
        const refresh_token = generateToken(
          payload,
          process.env.JWT_REFRESH_TOKEN_SECRET,
          process.env.JWT_REFRESH_TOKEN_LIFE
        );

        await Token.create({ token: refresh_token, expired: date });
        await Users.update({ is_login: true }, { where: { id: person.id } });
        await UserLogins.create({
          user_id: person.id,
          device_id,
          login_time: new Date(),
          is_login: true,
        });

        const data = {
          // id: person.id,
          full_name: person.full_name,
          email: person.email,
          first_login: person.first_login,
          access_token,
          refresh_token,
        };
        return outputParser.success(req, res, 'Berhasil Login', data);
      }
    } catch (err) {
      return next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      console.log('[LOG]: Logout');

      let decode = req.payload; //Verify Token

      const person = await Users.findOne({ where: { email: decode.email } });
      if (!person) {
        return next({
          name: 'InvalidEmail',
          function: 'OauthController.login',
        });
      } else {
        await UserLogins.update(
          {
            is_login: false,
          },
          {
            where: {
              user_id: decode.id,
              device_id: decode.device_id,
              is_login: true,
            },
          }
        );

        // await Users.update(
        //   {
        //     is_login: false,
        //   },
        //   { where: { email: decode.email } }
        // );
        return outputParser.success(req, res, 'Berhasil Logout');
      }
    } catch (err) {
      return next(err);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const token = req.header('authorization').split(' ');
      const refreshToken = token[1];

      if (!refreshToken) {
        return next({ name: 'RefreshTokenIsRequired' });
      }

      const refresh_token = await Token.findOne({
        where: { token: refreshToken },
      });
      if (!refresh_token) {
        return next({ name: 'RefreshTokenIsNotInDatabase' });
      }

      let decode = cekToken(refresh_token.token, process.env.JWT_REFRESH_TOKEN_SECRET); //Verify Token
      // const person = await Users.findOne({ where: { email: decode.email } });

      const payload = {
        id: decode.id,
        full_name: decode.full_name,
        email: decode.email,
      };
      const newAccessToken = generateToken(
        payload,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        process.env.JWT_ACCESS_TOKEN_EXPIRE
      );

      const data = {
        access_token: newAccessToken,
        refresh_token: refresh_token.token,
      };
      return outputParser.success(req, res, 'Refresh Token Berhasil', data);
    } catch (err) {
      return next({
        name: 'JWTExpired',
        function: 'OauthController.refreshToken',
      });
    }
  }

  static async updatePassword(req, res, next) {
    const { email, old_password, new_password, confirmation_password } = req.body;
    if (!email || !old_password || !new_password || !confirmation_password) {
      return next({ name: 'EmailOrPasswordCannotBeNull' });
    }
    try {
      if (new_password != confirmation_password) {
        return outputParser.error(req, res, 'Password tidak sama');
      }
      const person = await Users.findOne({ where: { email } });

      const match = comparePassword(old_password, person.password);
      if (!match) {
        return outputParser.error(req, res, 'Password lama tidak valid');
      } else {
        // Validasi password baru
        if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*_])[A-Za-z\d@$!%#*_]{8,16}$/.test(
            new_password
          )
        ) {
          return outputParser.error(
            req,
            res,
            'Password baru harus memiliki minimal 8 karakter, terdiri dari huruf kecil, huruf besar, angka, dan karakter khusus (@$!%*#?&)'
          );
        }

        await Users.update(
          {
            password: hashPassword(new_password),
            first_login: false,
          },
          { where: { email } }
        );

        return outputParser.success(req, res, 'Password berhasil diubah');
      }
    } catch (err) {
      return next({
        name: 'InvalidEmail',
        function: 'OauthController.updatePassword',
      });
    }
  }

  static async forgotPassword(req, res, next) {
    const { email, new_password, confirmation_password } = req.body;
    if (!email || !new_password || !confirmation_password) {
      return next({ name: 'EmailOrPasswordCannotBeNull' });
    }
    try {
      const person = await Users.findOne({ where: { email } });

      if (new_password != confirmation_password) {
        return outputParser.error(req, res, 'Password tidak sama');
      }

      if (!person) {
        return next({
          name: 'InvalidEmail',
          function: 'OauthController.forgotPassword',
        });
      }

      if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*_])[A-Za-z\d@$!%#*_]{8,16}$/.test(new_password)
      ) {
        return outputParser.error(
          req,
          res,
          'Password baru harus memiliki minimal 8 karakter, terdiri dari huruf kecil, huruf besar, angka, dan karakter khusus (@$!%*#?&)'
        );
      }
      await Users.update(
        {
          password: hashPassword(new_password),
        },
        { where: { email } }
      );

      // if (!personUpdate) {
      //     return next({ name: 'InvalidUpdatePassword', function: 'OauthController.forgotPassword' });
      // }

      return outputParser.success(
        req,
        res,
        'Password Berhasil di ubah, silahkan login dengan password baru'
      );
      // }
    } catch (err) {
      // return outputParser.internalServerError(req, res, err, 'Email Salah', 'forgotPassword');
      return next({
        name: 'InvalidEmail',
        function: 'OauthController.forgotPassword',
      });
    }
  }

  static async resetPassword(req, res, next) {
    const { email } = req.body;
    try {
      const person = await Users.findOne({ where: { email } });

      if (!person) {
        return outputParser.error(req, res, 'invalid Email / email tidak ditemukan', 404);
      }

      // Generate a token that expires in 5 minutes
      // const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });
      const payload = { email };
      const token = generateToken(
        payload,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        process.env.JWT_ACCESS_RESET_TOKEN_EXPIRE
      );

      await ResetPassword.create({
        email,
        token,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      });

      // Konfigurasi transporter Nodemailer untuk Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SEND, // Ganti dengan alamat email Gmail pengirim
          pass: process.env.EMAIL_PWD, // Ganti dengan kata sandi akun Gmail pengirim
        },
      });

      const resetLink = `https://grosri.xenmo.id/auth/update-password?email=${email}&token=${token}`;
      const mailOptions = {
        from: 'grosri.website@gmail.com',
        to: email,
        subject: 'Subject email',
        text: `Reset Password: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      return outputParser.success(req, res, 'Link Reset Password sudah terkirim ke Email');
    } catch (err) {
      return next({
        name: 'InvalidEmail',
        function: 'OauthController.forgotPassword',
      });
    }
  }

  static async validatePassword(req, res, next) {
  const { email, token } = req.body; // Menggunakan req.body untuk mendapatkan parameter dari body string
    // Log.info('[TEST] masuk sini', { email, token });
    try {
      // Mencari data reset password berdasarkan email dan token
      const resetPasswordData = await ResetPassword.findOne({
        where: { email, token },
      });

      // Log.info('[TEST] masuk sini', { resetPasswordData });

      if (!resetPasswordData) {
        return outputParser.error(req, res, 'Invalid email or token'); // Kembalikan respon jika email atau token tidak valid
      }

      // Mengecek apakah token sudah digunakan
      if (resetPasswordData.status === 'used') {
        return outputParser.error(req, res, 'Token has already been used');
      }

      // Mengecek apakah waktu kedaluwarsa kurang dari 5 menit dari sekarang
      if (resetPasswordData.expires_at <= new Date()) {
        return outputParser.error(req, res, 'Token has expired');
      }

      if (resetPasswordData.is_clicked) {
        return outputParser.error(req, res, 'Token has already been used');
      }

      resetPasswordData.is_clicked = true;
      await resetPasswordData.save();

      return outputParser.success(req, res, 'Token is valid');
    } catch (err) {
      return next({
        name: 'InvalidEmail',
        function: 'OauthController.forgotPassword',
      });
    }
  }

  static async requestEmail(req, res, next) {
    try {
      const { email, type } = req.body;
      if (!email || !type) {
        return outputParser.badRequest(req, res, 'Email dan Type tidak boleh kosong');
      }

      const checkLimit = await setLimitOtp('-', email, 'request');
      if (checkLimit.error) {
        return outputParser.errorCustom(req, res, checkLimit.message, checkLimit.data);
      }

      const person = await Users.findOne({ where: { email } });
      if (!person || person.email !== email) {
        return outputParser.notFound(req, res, 'Email Tidak ditemukan');
      }

      //Generate OTP
      const otp =
        process.env.NODE_ENV == 'development'
          ? 888888
          : Math.floor(100000 + Math.random() * 900000);
      const now = new Date();
      Log.info('OTP_TIME ', process.env.OTP_TIME);
      const expiration_time = AddMinutesToDate(now, process.env.OTP_TIME);

      //Create OTP instance in DB
      await OTP.create({
        otp,
        email,
        expiration_time,
        verified: false,
      });

      // Konfigurasi transporter Nodemailer untuk Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SEND, // Ganti dengan alamat email Gmail pengirim
          pass: process.env.EMAIL_PWD, // Ganti dengan kata sandi akun Gmail pengirim
        },
      });

      const mailOptions = {
        from: 'csmiling76@gmail.com', // Ganti dengan alamat email Gmail pengirim
        to: email, // Alamat email penerima
        subject: 'Subject email', // Subjek email
        text: 'OTP: ' + otp, // Isi pesan email
      };

      // Mengirim email
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      if (type === 'duplicated_account') {
        return outputParser.success(req, res, 'OTP dikirim ke Email, silahkan cek email', {
          otp,
          type,
        });
      }

      return outputParser.success(req, res, 'OTP dikirim ke Email, silahkan cek email', otp);
    } catch (err) {
      console.log('err ', err);
      return outputParser.success(req, res, 'OTP dikirim ke Email, silahkan cek email', err);
    }
  }
  static async resendEmail(req, res, next) {
    try {
      const { email, type } = req.body;
      if (!email || !type) {
        return outputParser.badRequest(req, res, 'Email dan Type tidak boleh kosong');
      }
      const checkLimit = await setLimitOtp('-', email, 'resend');
      if (checkLimit.error) {
        return outputParser.errorCustom(req, res, checkLimit.message, checkLimit.data);
      }

      const person = await Users.findOne({ where: { email } });
      if (!person || person.email !== email) {
        return outputParser.notFound(req, res, 'Email Tidak ditemukan');
      }

      //Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      const now = new Date();
      const expiration_time = AddMinutesToDate(now, 1);

      //Create OTP instance in DB
      await OTP.create({
        otp,
        email,
        expiration_time,
        verified: false,
      });

      // Konfigurasi transporter Nodemailer untuk Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SEND, // Ganti dengan alamat email Gmail pengirim
          pass: process.env.EMAIL_PWD, // Ganti dengan kata sandi akun Gmail pengirim
        },
      });

      const mailOptions = {
        from: 'csmiling76@gmail.com', // Ganti dengan alamat email Gmail pengirim
        to: email, // Alamat email penerima
        subject: 'Subject email', // Subjek email
        text: 'OTP: ' + otp, // Isi pesan email
      };

      // Mengirim email
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      if (type === 'duplicated_account') {
        return outputParser.success(req, res, 'OTP dikirim ke Email, silahkan cek email', {
          otp,
          type,
        });
      }

      return outputParser.success(req, res, 'OTP dikirim ke Email, silahkan cek email', otp);
    } catch (err) {
      console.log('err ', err);
      return outputParser.success(req, res, 'OTP dikirim ke Email, silahkan cek email', err);
    }
  }

  static async verifiedOtp(req, res, next) {
    try {
      const { email, otp, type = 'duplicated_account', device_id } = req.body;
      Log.info('MAsuk SINI 1', { email, otp, type, device_id });
      Log.info('MAsuk SINI 1');
      if (!email || !otp) {
        return next({
          name: 'EmailOrTypeCannotBeNull',
          function: 'OauthController.verifiedOtp',
        });
      }
      Log.info('MAsuk SINI');

      const checkLimit = await setLimitOtp('-', email, 'invalid_otp');
      if (checkLimit.error) {
        return outputParser.errorCustom(req, res, checkLimit.message, checkLimit.data);
      }
      Log.info('MAsuk SINI');

      const result = await setVerifiedKode(email, otp);
      if (result.error) {
        return outputParser.error(req, res, result.message, null);
      }

      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Request Timed Out'));
        }, 5000); // 5 seconds timeout
      });
      const otpTemp = await Promise.race([result, timeoutPromise]);

      // Update User.is_verify menjadi true
      const user = await Users.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        return outputParser.error(req, res, 'User tidak ditemukan');
      }

      user.is_verify = true;
      user.first_login = false;
      await user.save();

      if (type === 'duplicated_account') {
        const payload = {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          device_id,
        };

        let date = Date.now();
        const access_token = generateToken(
          payload,
          process.env.JWT_ACCESS_TOKEN_SECRET,
          process.env.JWT_ACCESS_TOKEN_EXPIRE
        );
        const refresh_token = generateToken(
          payload,
          process.env.JWT_REFRESH_TOKEN_SECRET,
          process.env.JWT_REFRESH_TOKEN_LIFE
        );

        await Token.create({ token: refresh_token, expired: date });
        await UserLogins.create({
          user_id: user.id,
          device_id,
          login_time: new Date(),
          is_login: true,
        });
        return outputParser.success(req, res, 'OTP Match', { type, access_token });
      }
      return outputParser.success(req, res, 'OTP Match', otpTemp);
    } catch (err) {
      if (err.message === 'Request Timed Out') {
        return outputParser.error(req, res, 'Request Timed Out');
      }
      return next({
        name: 'InvalidEmail',
        function: 'OauthController.verifiedOtp',
      });
    }
  }
}

module.exports = {
  OauthController,
};
