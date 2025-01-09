const { LimitOtp } = require('../models');
const moment = require('moment');
const { Log } = require('../utils/customLog');
const { Op } = require('sequelize');

const setLimitOtp = async (companyCode, email, tipe) => {
  const limited = Number(process.env.LIMIT_OTP) || 3;
  try {
    let where = { email, tipe: tipe == 'request' ? 'resend' : tipe, companyCode };
    Log.info({ where });

    const data = await LimitOtp.findOne({
      where,
      attributes: ['id', 'tipe', 'email', 'jumlah', 'tanggal_unlock'],
      // raw: true,
      order: [['createdAt', 'DESC']],
    });
    Log.info('LOG DATA >> ', data);
    if (!data) {
      let jumlah = tipe == 'resend' ? 0 : 0;
      if (['resend', 'invalid_otp'].includes(tipe)) {
        await LimitOtp.create({
          tipe,
          email,
          companyCode,
          jumlah,
        });
      }

      return { error: false, limit: 1 };
    }

    const { id, jumlah } = data;
    const newCount = jumlah + 1;
    const updateData = { jumlah: newCount };

    if (newCount == limited) {
      let tgl = moment().add(0.5, 'hours').toDate();
      Object.assign(updateData, { tanggal_unlock: tgl });
      await LimitOtp.update(updateData, { where: { id } });
      data.jumlah = newCount;
      data.tanggal_unlock = tgl;
      delete data.id;
      return {
        error: true,
        data,
        limit: limited,
        // message: `Sudah mencapai limit ${tipe} sebanyak ${limited} Kali`,
        message: `Anda telah mencapai batas limit OTP, coba lagi dalam 30 menit.`,
      };
    } else if (newCount > limited) {
      delete data.id;
      return {
        error: true,
        data,
        limit: limited,
        // message: `Sudah mencapai limit ${tipe} sebanyak ${limited} Kali`,
        message: `Anda telah mencapai batas limit OTP, coba lagi dalam 30 menit.`,
      };
    }

    await LimitOtp.update(updateData, { where: { id } });
    return { error: false, limit: newCount };
  } catch (err) {
    Log.error('set limit otp', err.message);
    return { error: true, message: err.message };
  }
};

module.exports = {
  setLimitOtp,
};
