'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubscribeHistory extends Model {
    static associate(models) {
      SubscribeHistory.belongsTo(models.Subscribe, {
        foreignKey: 'id',
        as: 'subscribe',
      });
    }
  }
  SubscribeHistory.init(
    {
      jumlah: DataTypes.INTEGER,
      sisa: DataTypes.FLOAT,
      invoice: DataTypes.STRING,
      status: DataTypes.STRING,
      subscribe_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'SubscribeHistory',
      tableName: 'SubscribeHistories',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return SubscribeHistory;
};
