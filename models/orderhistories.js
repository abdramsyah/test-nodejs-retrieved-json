'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderHistories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderHistories.belongsTo(models.Orders, {
        foreignKey: 'order_id',
      });
    }
  }
  OrderHistories.init(
    { 
      order_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      updated_by: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      date_pickup: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'OrderHistories',
      tableName: 'OrderHistories',
    }
  );
  return OrderHistories;
};
