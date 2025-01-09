'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Company.init(
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      code: DataTypes.STRING,
      telp: DataTypes.STRING,
      handphone: DataTypes.STRING,
      email: DataTypes.STRING,
      status: DataTypes.STRING,
      delete_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Company',
      // tableName: 'Companies',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Company;
};
