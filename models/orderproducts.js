'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderProducts.belongsTo(models.Orders, {
        foreignKey: 'order_id',
      });

      // Sekarang, Anda juga perlu mendefinisikan relasi untuk OrderProducts dengan Product (many-to-one)
      OrderProducts.belongsTo(models.Products, {
        foreignKey: 'product_id',
        targetKey: 'id', // Kolom target yang menjadi referensi
        as: 'product', // Ini adalah alias untuk relasi ini
      });
    }
  }
  OrderProducts.init(
    {
      order_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      base_price: DataTypes.FLOAT,
      base_price_discount: DataTypes.FLOAT,
      discount: DataTypes.BOOLEAN,
      discount_price: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: 'OrderProducts',
      tableName: 'OrderProducts',
    }
  );
  return OrderProducts;
};
