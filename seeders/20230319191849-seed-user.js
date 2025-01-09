'use strict';

const casual = require('casual');
const moment = require('moment');
const { hashPassword } = require('../helpers/generalHelpers');

function generateSubscriberID() {
  const timestamp = Date.now().toString();
  const randomDigits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return timestamp + randomDigits;
}

const user = require('../source/data-users-grosri.json');

// https://pravatar.cc/images
const fakeImageId = [5, 9, 11, 12, 13, 14, 19, 26, 28, 40, 53, 58, 62];
const fakeGaji = [3000000, 3500000, 4000000, 4500000, 5000000, 6000000];

let seedLimit = [];
user.forEach((e, idx) => {
  e.password = hashPassword(e.password);
  e.createdAt = new Date();
  e.updatedAt = new Date();
  e.first_login = false;
  e.is_verify = true;

  if (!e.subscriber_id) {
    e.subscriber_id = generateSubscriberID();
  }

  if (!e.status) {
    e.status = 'ACTIVE';
  }

  if (!e.role) {
    e.role = 'karyawan';
  }

  let randomInteger = casual.integer(0, 100) * -1;

  e.avatar =
    'https://i.pravatar.cc/150?img=' + casual.random_element(fakeImageId);
  e.nik = 'NIK' + casual.email;
  e.jabatan = casual.random_element([
    'Kepala Divisi IT',
    'Manager',
    'Sales',
    'Teknisi',
  ]);
  e.phone = casual.password;
  e.birthplace = casual.state;
  e.gender = casual.random_element(['laki-laki', 'perempuan']);
  e.identity_number = casual.unix_time;
  e.address = casual.address;
  e.tanggal_gabung = moment().add(randomInteger, 'days').toDate();
  e.gaji = casual.random_element(fakeGaji);

  randomInteger += casual.integer(0, 10);
  const tgl = moment().add(randomInteger, 'days').toDate();
  seedLimit.push({
    id: idx + 1,
    user_id: e.id,
    saldo_limit: casual.random_element([500000, 1000000, 1500000, 2000000]),
    status: casual.random_element([
      'AKTIF',
      'KONFIRMASI',
      'TIDAK-AKTIF',
      'DITOLAK',
    ]),
    tanggal_diajukan: tgl,
    diajukan_oleh: 1,
    tanggal_disetujui: tgl,
    disetujui_oleh: 1,
    alasan: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Users', user, {});
    // await queryInterface.bulkInsert('LimitValue', seedLimit, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('LimitValue', null, {});
  },
};
