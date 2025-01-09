'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      base_price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      base_price_discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      discount_price: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: true,
      },
      discount: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      discount_type: {
        type: Sequelize.ENUM(['PERCENTAGE', 'NOMINAL']),
        // defaultValue: 'PERCENTAGE',
        allowNull: true,
      },
      discount_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      prioritas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(['ACTIVE', 'INACTIVE']),
        defaultValue: 'ACTIVE',
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
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
    await queryInterface.dropTable('Products');
  },
};
