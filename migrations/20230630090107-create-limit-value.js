'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LimitValue', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
      saldo_limit: {
        type: Sequelize.FLOAT,
      },
      saldo_terpakai: {
        type: Sequelize.FLOAT,
      },
      status: {
        type: Sequelize.ENUM(['AKTIF', 'KONFIRMASI', 'TIDAK-AKTIF', 'DITOLAK']),
        defaultValue: 'KONFIRMASI',
      },

      tanggal_diajukan: {
        type: Sequelize.DATE,
      },
      diajukan_oleh: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
      tanggal_disetujui: {
        type: Sequelize.DATE,
      },
      disetujui_oleh: {
        type: Sequelize.INTEGER,
      },
      alasan: {
        type: Sequelize.TEXT,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('LimitValue');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_LimitValue_status";');
  },
};
