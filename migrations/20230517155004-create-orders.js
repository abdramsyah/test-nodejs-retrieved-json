'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SubscribeProduct', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      subscribe_detail: {
        type: Sequelize.STRING,
      },
      total_product: {
        type: Sequelize.INTEGER,
      },
      total_belanja: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: false,
      },
      product_id: {
        type: Sequelize.JSON,
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      period: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.STRING,
      },
      noted: {
        type: Sequelize.STRING,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SubscribeProduct');
  },
};
