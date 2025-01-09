'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      subscriber_id: {
        type: Sequelize.STRING,
        unique: true,
      },

      // auth
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM(['karyawan', 'hrd', 'admin', 'user', 'super_admin', 'operation']),
        defaultValue: 'karyawan',
      },
      status: {
        type: Sequelize.ENUM(['ACTIVE', 'INACTIVE']),
        defaultValue: 'INACTIVE',
      },

      // company detail
      company: {
        type: Sequelize.STRING,
      },
      companyCode: {
        type: Sequelize.STRING,
      },

      // personal data
      nik: {
        type: Sequelize.STRING,
      },
      jabatan: {
        type: Sequelize.STRING,
      },
      full_name: {
        type: Sequelize.STRING,
      },
      avatar: {
        type: Sequelize.TEXT,
      },
      phone: {
        type: Sequelize.STRING,
      },
      birthplace: {
        type: Sequelize.STRING,
      },
      birthday: {
        type: Sequelize.DATE,
      },
      gender: {
        type: Sequelize.ENUM(['laki-laki', 'perempuan']),
        defaultValue: 'laki-laki',
      },
      gaji: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      identity_number: {
        type: Sequelize.STRING,
        unique: true,
      },
      address: {
        type: Sequelize.TEXT,
      },
      tanggal_gabung: {
        type: Sequelize.DATE,
      },

      is_login: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      first_login: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      is_verify: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('Users', ['email']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Users');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_role";'
    );
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_marital_status";');
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_blood_type";');
  },
};
