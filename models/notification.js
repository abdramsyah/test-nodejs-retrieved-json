'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notification.init(
    {
      title: DataTypes.STRING,
      message: DataTypes.STRING,
      order_number: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      isRead: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'Notification',
      // timestamps: true,
      // createdAt: 'created_at',
      // updatedAt: 'updated_at',
    }
  );
  return Notification;
};