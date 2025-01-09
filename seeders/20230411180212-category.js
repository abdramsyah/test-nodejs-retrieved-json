'use strict';

/** @type {import('sequelize-cli').Migration} */

const Categories = require('../source/categories.json');
Categories.forEach((e) => {
  // e.id = i++
  e.created_at = new Date();
  e.updated_at = new Date();
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', Categories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  },
};
