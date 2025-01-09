'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscribe extends Model {
    static associate(models) {
      Subscribe.hasMany(models.SubscribeHistory, {
        foreignKey: 'subscribe_id',
        as: 'subscribe_histories',
      });
    }
  }
  Subscribe.init(
    {
      subscribe_detail: DataTypes.STRING,
      total_product: DataTypes.INTEGER,
      total_belanja: DataTypes.FLOAT,
      status: DataTypes.STRING,
      product_id: DataTypes.JSON,
      user_id: DataTypes.INTEGER,
      period: DataTypes.STRING,
      date: DataTypes.STRING,
      noted: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Subscribe',
      tableName: 'Subscribe',
    }
  );
  return Subscribe;
};
