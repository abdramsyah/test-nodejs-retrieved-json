const { validationResult } = require('express-validator');
const { cekToken, hashPassword } = require('../../../helpers/generalHelpers');
const {
  Users,
  Categories,
  Faq,
  Products,
  Events,
  TermsAndConditions,
  PrivacyPolicy,
  Notification,
  ValueActivation,
} = require('../../../models');
const { Log } = require('../../../utils/customLog');
const { outputParser } = require('../../../utils/outputParser');
const constant = require('../../../config/constant');
const { generateNewKode, sendKodeOtp } = require('../../../service/sendKodeOtp');
const { setLimitOtp } = require('../../../service/limitKodeOtp');
const Op = require('sequelize').Op;

class UserController {
  static async registerNewUser(req, res) {
    Log.info('[LOG]: Create New User');
    let errs = validationResult(req);
    if (!errs.isEmpty()) {
      Log.error(errs);
      return outputParser.errorValidatorFirst(req, res, errs);
    }

    const { email, full_name, phone, password } = req.body;

    /**
     * sementara check email saja,
     * login di PWA cuma email password, jadi email ga boleh kembar
     */
    const existingEmail = await Users.findOne({
      where: { email },
    });
    if (existingEmail && existingEmail.is_verify === true) {
      return outputParser.errorCustom(req, res, 'Email sudah terdaftar');
    }

    try {
      // define data user
      let data = {
        email,
        password: hashPassword(password),
        // personal data
        full_name,
        phone,
        // static data
        avatar: constant.AVATAR.DEFAULT,
        role: constant.ROLES.USER,
        status: constant.STATUS.ACTIVE,
        is_login: false,
        first_login: false,
        is_verify: false,
      };

      if (existingEmail && existingEmail.is_verify === false) {
        await Users.update(data, {
          where: {
            id: existingEmail.id,
          },
        });
      } else {
        await Users.create(data);
      }
      const checkLimit = await setLimitOtp('-', email, 'request');
      if (checkLimit.error) {
        return outputParser.errorCustom(req, res, checkLimit.message, checkLimit.data);
      }
      // generate OTP
      const genOtp = await generateNewKode(email);
      if (genOtp.error) {
        return outputParser.errorCustom(req, res, genOtp.mesage, null);
      }

      // send email
      const sendOtp = await sendKodeOtp(email, genOtp.kode);
      if (sendOtp.error) {
        return outputParser.errorCustom(req, res, sendOtp.message, null);
      }

      return outputParser.success(req, res, {
        message: 'Akunmu sudah berhasil dibuat, silahkan verify OTP untuk aktifkan akunmu!',
      });
    } catch (err) {
      Log.error('tambah karyawan', err);
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }

  static async activatedGrosriValue(req, res) {
    const { full_name, identity_number, nik, code_company, email } = req.body;

    const user = await Users.findOne({
      where: { email },
    });

    try {
      let data = {
        user_id: user.id,
        full_name,
        identity_number,
        nik,
        activation_status: 'WAITING_CONFIRM',
        code_company,
        email,
      };

      await ValueActivation.create(data);

      const checkLimit = await setLimitOtp('-', email, 'signup_grosri_value');
      if (checkLimit.error) {
        return outputParser.errorCustom(req, res, checkLimit.message, checkLimit.data);
      }
      // generate OTP
      const genOtp = await generateNewKode(email);
      if (genOtp.error) {
        return outputParser.errorCustom(req, res, genOtp.mesage, null);
      }

      // send email
      const sendOtp = await sendKodeOtp(email, genOtp.kode);
      if (sendOtp.error) {
        return outputParser.errorCustom(req, res, sendOtp.message, null);
      }

      return outputParser.success(req, res, {
        message: 'Akunmu behasil diajukan',
      });
    } catch (err) {
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }

  static async updatePhotoProfile(req, res) {
    try {
      const { id } = req.payload;
      if (!id) {
        throw new Error(`Can't process request`);
      }

      const updateData = { avatar: req.image };
      const kondisi = { where: { id } };
      await Users.update(updateData, kondisi);

      return outputParser.success(req, res, 'Success edit photo', null);
    } catch (err) {
      return outputParser.error(req, res, err.message, null);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { full_name, gender, birthday, email } = req.body;

      // Validasi full_name
      const nameRegex = /^[a-zA-Z ]{5,}$/;
      if (!nameRegex.test(full_name)) {
        return next({
          name: 'InvalidFullName',
          function: 'UserController.home',
        });
      }

      const token = req.header('authorization').split(' ');
      const refreshToken = token[1];
      if (!token || !refreshToken) {
        return next({
          name: 'InvalidRefreshToken',
          function: 'UserController.home',
        });
      }

      const dataToUpdate = {};
      if (full_name) dataToUpdate.full_name = full_name;
      // if (avatar) dataToUpdate.avatar = avatar;
      if (gender) dataToUpdate.gender = gender;
      if (birthday) dataToUpdate.birthday = birthday;

      if (Object.keys(dataToUpdate).length > 1) {
        return next({ name: 'OnlyChangeOneField' });
      }

      const person = await Users.findOne({ where: { email } });
      if (!person) {
        return next({ name: 'InvalidEmail', function: 'UserController.login' });
      }

      const persons = await Users.update(dataToUpdate, { where: { email } });

      return outputParser.success(req, res, 'Update Profile Berhasil', persons);
    } catch (err) {
      return next({
        name: 'InvalidEmail',
        function: 'UserController.updatePassword',
      });
    }
  }

  static async profile(req, res, next) {
    try {
      console.log('[LOG]: Get Profile ');
      const token = req.header('authorization').split(' ')[1];

      if (!token) {
        return next({ name: 'RefreshTokenIsRequired' });
      }

      let decode = cekToken(token, process.env.JWT_ACCESS_TOKEN_SECRET); //Verify Token
      const person = await Users.findOne({
        where: { email: decode.email },
        attributes: ['full_name', 'email', 'company', 'gender', 'avatar', 'birthday', 'phone'],
      });
      console.log(person);
      if (!person) {
        return next({ name: 'InvalidEmail', function: 'UserController.login' });
      }
      const data = {};

      data.user = person;

      return outputParser.success(req, res, 'Get Profile Berhasil', data);
    } catch (err) {
      return next({ name: 'InvalidEmail', function: 'UserController.Profile' });
    }
  }

  static async home(req, res, next) {
    try {
      const token = req.header('authorization').split(' ');
      const refreshToken = token[1];

      const data = {};
      const user = {};
      let is_notif = false;
      if (refreshToken) {
        let decode = cekToken(refreshToken, process.env.JWT_ACCESS_TOKEN_SECRET);

        const person = await Users.findOne({ where: { email: decode.email } });
        const status_limit_value = await ValueActivation.findOne({ where: { user_id: decode.id } });

        if (!status_limit_value) {
          user.status_limit = 'NOT_REGISTRED';
        } else {
          user.status_limit = status_limit_value.activation_status;
        }
        const general = await Notification.findAll({
          where: {
            userId: decode.id,
            isRead: false,
          },
          order: [['createdAt', 'DESC']],
          limit: 10,
          raw: true,
          nest: true,
        });

        if (general.length > 0) {
          is_notif = true;
        }
        user.full_name = person.full_name;
        user.avatar = person.avatar;

        // user.grosri_value = await LimitValue.findOne({ where: { user_id: decode.id } });
      } else {
        user.full_name = 'Guest';
        user.avatar = '';
      }

      const banners = {
        image: '',
        title: '',
        link: '',
      };

      const events = await Events.findAll({
        include: {
          model: Products,
          limit: 5,
        },
        where: {
          id: {
            [Op.not]: 2,
          },
        },
        attributes: ['id', 'event_name', 'slug', 'start_date', 'end_date'],
      });

      const modifiedEvents = events.map((event) => {
        const modifiedProducts = event.Products.map((product) => {
          if (product.discount !== null) {
            const price = (product.base_price * (100 - product.discount)) / 100;
            return { ...product.toJSON(), price };
          } else {
            return product;
          }
        });
        return { ...event.toJSON(), Products: modifiedProducts };
      });

      const recomendation = await Events.findAll({
        include: {
          model: Products,
          limit: 5,
        },
        // Menambahkan kondisi WHERE berdasarkan ID
        where: { id: 2 },
        attributes: ['id', 'event_name', 'slug', 'start_date', 'end_date'],
      });

      // Memodifikasi event dan produk dengan menghitung harga diskon
      const recomendations = recomendation.map((event) => {
        const modifiedProducts = event.Products.map((product) => {
          if (product.discount !== null) {
            const price = (product.base_price * (100 - product.discount)) / 100;
            return { ...product.toJSON(), price };
          } else {
            return product;
          }
        });
        return { ...event.toJSON(), Products: modifiedProducts };
      });

      const categories = await Categories.findAll({
        order: [['sort', 'ASC']], // Order by the 'id' column in ascending order
      });
      data.categories = categories;
      data.user = user;
      data.event = modifiedEvents;
      // data.recomendation = recomendations;
      // data.banner = banners;
      data.is_notif = is_notif;
      // data.grosri_value = grosri_value;

      return outputParser.success(req, res, 'Get Data Home Berhasil', data);
    } catch (error) {
      Log.error(error);
      return next({ name: 'InvalidEmail', function: 'updateProfile.home' });
    }
  }

  static async faq(req, res, next) {
    try {
      const faq = await Faq.findAll({
        attributes: ['id', 'pertanyaan', 'jawaban'],
        order: [['id', 'ASC']],
      });
      if (!faq) {
        return next({ name: 'InvalidFaq', function: 'UserController.faq' });
      }
      return outputParser.success(req, res, 'Get Faq Berhasil', faq);
    } catch (err) {
      return next({ name: 'InvalidFaq', function: 'UserController.faq' });
    }
  }

  static async createTermsAndConditions(req, res, next) {
    try {
      const { title, content } = req.body;

      // Buat TermsAndConditions baru
      const newTermsAndConditions = await TermsAndConditions.create({
        title,
        content,
      });

      // Mengembalikan respons sukses
      return outputParser.success(
        req,
        res,
        'Create Terms And Conditions Berhasil',
        newTermsAndConditions
      );
    } catch (err) {
      // Tangani kesalahan
      return next(err);
    }
  }

  static async getAllTermsAndConditions(req, res, next) {
    try {
      // Ambil semua TermsAndConditions
      const termsAndConditions = await TermsAndConditions.findAll({
        order: [['id', 'ASC']],
      });

      // Mengembalikan respons dengan semua TermsAndConditions
      return outputParser.success(
        req,
        res,
        'Get Terms And Conditions Berhasil',
        termsAndConditions
      );
    } catch (err) {
      // Tangani kesalahan
      return next(err);
    }
  }

  static async getAllPrivacyPolicy(req, res, next) {
    try {
      const termsAndConditions = await PrivacyPolicy.findAll({
        order: [['id', 'ASC']],
      });

      return outputParser.success(req, res, 'Get Privacy Policy Berhasil', termsAndConditions);
    } catch (err) {
      // Tangani kesalahan
      return next(err);
    }
  }
}

module.exports = {
  UserController,
};
