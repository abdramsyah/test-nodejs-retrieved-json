'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      cart.belongsTo(models.Subscribe, { foreignKey: 'id' });
    }
  }
  cart.init({
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    email: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
    subscribe_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Cart',
  });
  return cart;
};