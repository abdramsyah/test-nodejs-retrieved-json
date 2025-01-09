'use strict';

const events = [
  {
    id: 1,
    event_name: 'Ramadhan Kareem',
    slug: 'ramadhan-kareem',
    // is_active: true,
    status: true,
    prioritas: 1,
  },
  {
    id: 2,
    event_name: 'Mungkin Kamu Suka',
    slug: `mks`,
    // is_active: true,
    status: true,
    prioritas: 2,
  },
  {
    id: 3,
    event_name: 'September',
    slug: `september`,
    // is_active: false,
    status: false,
    prioritas: 3,
  },
];

events.forEach((e) => {
  e.created_at = new Date();
  e.updated_at = new Date();
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Events', events, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Events', null, {});
  },
};
