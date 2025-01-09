'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Promo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Promo.init({
    title: DataTypes.STRING,
    message: DataTypes.STRING,
    banner: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    isRead: DataTypes.BOOLEAN,
    event_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Promo',
    tableName: 'Promo',
  });
  return Promo;
};