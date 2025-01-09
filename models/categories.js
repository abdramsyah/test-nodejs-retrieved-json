'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      Categories.hasMany(models.Products, {
        onDelete: 'CASCADE',
        foreignKey: 'category_id',
      });
      Categories.hasMany(models.ProductType, {
        onDelete: 'CASCADE',
        foreignKey: 'category_id',
      });
    }
  }
  Categories.init(
    {
      category_name: DataTypes.STRING,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      sort: DataTypes.INTEGER,
      status: DataTypes.ENUM(['ACTIVE', 'INACTIVE']),
      created_by: DataTypes.STRING,
      updated_by: DataTypes.STRING,
      deleted_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Categories',
      tableName: 'Categories',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Categories;
};
