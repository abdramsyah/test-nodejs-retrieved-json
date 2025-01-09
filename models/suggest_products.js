'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class suggest_products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  suggest_products.init({
    suggest_product: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'suggest_products',
  });
  return suggest_products;
};