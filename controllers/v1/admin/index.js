const { AdminController } = require('./admin');
const { CategoryController } = require('./category');
const { ProductController } = require('./products');
const AdminValidator = require('./validator.js');

module.exports = {
  AdminController,
  CategoryController,
  ProductController,
  AdminValidator,
};
