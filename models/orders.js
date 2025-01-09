'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Orders.hasMany(models.OrderProducts, {
        foreignKey: 'order_id',
        as: 'order_products', // Ini adalah alias untuk relasi ini
      });

      Orders.hasMany(models.OrderHistories, {
        foreignKey: 'order_id',
        as: 'order_histories', // Ini adalah alias untuk relasi ini
      });

      Orders.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Orders.init(
    {
      order_number: DataTypes.STRING,
      status: DataTypes.STRING,
      total_product: DataTypes.INTEGER,
      total: DataTypes.FLOAT,
      sub_total: DataTypes.FLOAT,
      user_id: DataTypes.INTEGER,
      payment: DataTypes.STRING,
      date_pickup: DataTypes.STRING,
      noted: DataTypes.STRING,
      images: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Orders',
      tableName: 'Orders',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Orders;
};
