'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLogin extends Model {
    static associate(models) {
      // define association here
    }
  }
  UserLogin.init(
    {
      user_id: DataTypes.INTEGER,
      device_id: DataTypes.STRING,
      login_time: DataTypes.DATE,
      is_login: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'UserLogins',
      tableName: 'UserLogins',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return UserLogin;
};
