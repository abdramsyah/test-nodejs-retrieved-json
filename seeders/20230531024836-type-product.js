'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const ProductType = [
      {
        id: 1,
        category_id: 1,
        name_type_product: "Beras",
        images: "https://i.imgur.com/M6lPt7b.jpeg",
      },
      {
        id: 2,
        category_id: 1,
        name_type_product: "Minyak Goreng",
        images: "https://i.imgur.com/KygaKFc.jpeg",
      },
      {
        id: 3,
        category_id: 1,
        name_type_product: "Gula",
        images: "https://i.imgur.com/C6GU00C.jpeg",
      },
      {
        id: 4,
        category_id: 1,
        name_type_product: "Susu",
        images: "https://i.imgur.com/KbTQOnc.jpeg",
      },
    ]
    let i = 1;
    ProductType.forEach((e) => {
      e.id = i++
      e.createdAt = new Date();
      e.updatedAt = new Date();
    })
    await queryInterface.bulkInsert('ProductType', ProductType, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('ProductType', null, {});
  }
};
