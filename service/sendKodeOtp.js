const { OTP } = require('../models');
const nodemailer = require('nodemailer');
const moment = require('moment');
const { Log } = require('../utils/customLog');
const { emailOtpGrosri } = require('../template/email');
const updatePasswordAdmin = require('../template/email/updatePasswordAdmin');

const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const generateNewKode = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const minutes = Number(process.env.MAX_LIFE_OTP) || 1;
  const expiration_time = moment().add(minutes, 'minutes').toDate();
  try {
    await OTP.destroy({ where: { email } });
    await OTP.create({
      otp,
      email,
      expiration_time,
      verified: false,
    });
    return { error: false, kode: otp, message: '' };
  } catch (err) {
    return { error: true, kode: null, mesage: err.message };
  }
};

const setVerifiedKode = async (email, kode) => {
  const result = { error: false, message: '' };
  try {
    const existingOtp = await OTP.findOne({
      where: { email, otp: kode, verified: false },
    });
    if (!existingOtp) {
      result.error = true;
      result.message = 'OTP tidak valid';
      return result;
    }

    const now = moment();
    const otp_time = moment(existingOtp.expiration_time);
    if (now.isAfter(otp_time)) {
      result.error = true;
      result.message = 'Kode otp kadaluarsa';
      return result;
    }

    await OTP.update({ verified: true }, { where: { email, otp: kode } });
  } catch (err) {
    console.log(err);
    result.error = true;
    result.message = err.mesage;
  }
  return result;
};

const sendKodeOtp = async (email, otp) => {
  const result = { error: false, message: '' };
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email, // Alamat email penerima
    subject: 'Subject email', // Subjek email
    text: 'OTP: ' + otp, // Isi pesan email
    html: '',
  };
  try {
    await smtpTransport.sendMail(mailOptions);
  } catch (err) {
    result.error = true;
    result.message = err.message;
  }
  return result;
};

const sendLinkResetPassword = async (email, token) => {
  const resetLink = `https://grosri.xenmo.id/auth/update-password?email=${email}&token=${token}`;
  const result = { error: false, message: '' };
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email, // Alamat email penerima
    subject: 'Link Perubahan Password', // Subjek email
    text: 'Link: ' + resetLink, // Isi pesan email
    html: '',
  };
  try {
    await smtpTransport.sendMail(mailOptions);
  } catch (err) {
    result.error = true;
    result.message = err.message;
  }
  return result;
};

const sendLinkResetPasswordAdmin = async (email, full_name, token) => {
  // const resetLink = `https://ops-apps.grosri.id/admin/auth/update-password?email=${email}&token=${token}`;
  const resetLink = `https://ops-dev.grosri.id/admin/auth/update-password?email=${email}&token=${token}`;
  const result = { error: false, message: '' };
  const template = updatePasswordAdmin(full_name, email, resetLink);
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email, // Alamat email penerima
    subject: 'Link Perubahan Password', // Subjek email
    text: 'Link: ' + resetLink, // Isi pesan email
    html: `${template}`,
  };
  try {
    await smtpTransport.sendMail(mailOptions);
  } catch (err) {
    result.error = true;
    result.message = err.message;
  }
  return result;
};

module.exports = {
  generateNewKode,
  setVerifiedKode,
  sendKodeOtp,
  sendLinkResetPassword,
  sendLinkResetPasswordAdmin,
};
