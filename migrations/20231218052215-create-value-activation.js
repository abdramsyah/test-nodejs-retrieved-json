'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ValueActivations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        // onDelete: 'CASCADE',
      },
      full_name: {
        type: Sequelize.STRING,
      },
      identity_number: {
        type: Sequelize.STRING,
      },
      nik: {
        type: Sequelize.STRING,
      },
      activation_status: {
        type: Sequelize.ENUM(
          'NOT_REGISTRED',
          'WAITING_CONFIRM',
          'REGISTRED',
          // 'ACTIVATED',
          'REJECTED'
        ),
        defaultValue: 'NOT_REGISTRED',
      },
      code_company: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ValueActivations');
  },
};
