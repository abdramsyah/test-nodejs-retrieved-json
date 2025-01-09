'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ResetPassword extends Model {
    static associate(models) {}
  }
  ResetPassword.init(
    {
      email: DataTypes.STRING,
      token: DataTypes.STRING,
      status: DataTypes.ENUM(['unused', 'used']),
      is_clicked: DataTypes.BOOLEAN,
      expires_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'ResetPassword',
      tableName: 'ResetPasswords',
    }
  );
  return ResetPassword;
};
