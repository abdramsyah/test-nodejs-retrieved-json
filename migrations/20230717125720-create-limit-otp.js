'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LimitOtps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tipe: {
        type: Sequelize.STRING,
        defaultValue: 'request',
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      companyCode: {
        type: Sequelize.STRING,
      },
      limit_attemps: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      jumlah: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tanggal_unlock: {
        allowNull: true,
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('LimitOtps');
  },
};
