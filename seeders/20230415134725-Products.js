'use strict';
const casual = require('casual');
const { map } = require('lodash');

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

const categories = [
  { id: 1, category_name: 'Sembako' },
  { id: 2, category_name: 'Daging' },
  { id: 3, category_name: 'Buah' },
  { id: 4, category_name: 'Sayuran' },
  { id: 5, category_name: 'Seafood' },
  { id: 6, category_name: 'Produk Beku' },
  { id: 7, category_name: 'Bumbu Masak' },
  { id: 8, category_name: 'Bahan Masakan' },
  { id: 9, category_name: 'Cemilan' },
  { id: 10, category_name: 'Kopi & Teh' },
  { id: 11, category_name: 'Susu & Sereal' },
  { id: 12, category_name: 'Minuman' },
  { id: 13, category_name: 'Kecap & Saus' },
  { id: 14, category_name: 'Makan Instan' },
  { id: 15, category_name: 'Kosmetik' },
  { id: 16, category_name: 'Obatan' },
  { id: 17, category_name: 'Ibu & Anak' },
  { id: 18, category_name: 'Perawatan Rumah' },
  { id: 19, category_name: 'Perawatan Diri' },
];


const products = require('../source/data-product-grosri.json');
const categoryMap = {};
categories.forEach(category => {
  categoryMap[category.category_name] = category.id;
});

// Mengupdate category_id pada setiap produk dan menghapus category_name
const updatedProducts = products.map(product => {
  const { category_name, ...rest } = product; // Menggunakan destructuring untuk memisahkan category_name
  return {
    ...rest,
    category_id: categoryMap[category_name],
    createdAt: new Date(),
    updatedAt: new Date()
  };
});

// console.log(updatedProducts);
    await queryInterface.bulkInsert('Products', updatedProducts, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
    */
    await queryInterface.bulkDelete('Products', null, {});
  }
};
