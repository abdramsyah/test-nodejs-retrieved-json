'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LimitOtp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LimitOtp.init(
    {
      tipe: DataTypes.STRING,
      email: DataTypes.STRING,
      jumlah: DataTypes.INTEGER,
      companyCode: DataTypes.STRING,
      limit_attemps: DataTypes.INTEGER,
      tanggal_unlock: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'LimitOtp',
    }
  );
  return LimitOtp;
};
