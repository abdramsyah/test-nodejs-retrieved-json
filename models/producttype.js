'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductType.belongsTo(models.Categories, {
        foreignKey: 'category_id'
      });
    }
  }
  ProductType.init({
    category_id: DataTypes.INTEGER,
    name_type_product: DataTypes.STRING,
    images: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProductType',
    tableName: 'ProductType',
  });
  return ProductType;
};