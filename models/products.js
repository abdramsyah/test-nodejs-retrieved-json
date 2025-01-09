'use strict';
const { Model, INTEGER } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    static associate(models) {
      Products.belongsTo(models.Categories, { foreignKey: 'category_id' });
      Products.belongsTo(models.Events, { foreignKey: 'id' });
      Products.hasMany(models.OrderProducts, {
        foreignKey: 'product_id',
        as: 'order_products', // Gunakan alias yang sesuai
      });
    }
  }
  Products.init(
    {
      // detail produck
      product_name: DataTypes.STRING,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      stock: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,

      base_price: DataTypes.FLOAT, // harga jual dari grosri
      base_price_discount: DataTypes.FLOAT, // harga jual - harga discount yang di dapatkan (base_price - discount_price)

      discount_price: DataTypes.FLOAT, // discount dalam bentuk nominal dan harga discount yang didapatkan
      discount: DataTypes.BOOLEAN, // Flag discount TRUE or FALSE
      discount_percentage: DataTypes.INTEGER, // discount dalam bentuk percent
      discount_type: DataTypes.STRING,

      prioritas: DataTypes.INTEGER,
      status: DataTypes.STRING,

      event_id: DataTypes.INTEGER,
      deleted_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Products',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  return Products;
};
