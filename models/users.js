'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Users.hasOne(models.LimitValue, {
        as: 'limit_value',
        foreignKey: 'user_id',
      });
    }
  }
  Users.init(
    {
      subscriber_id: DataTypes.STRING,

      // auth
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.ENUM([
        'karyawan',
        'hrd',
        'admin',
        'user',
        'super_admin',
        'operation',
      ]),
      status: DataTypes.ENUM(['ACTIVE', 'INACTIVE']),

      // company detail
      company: DataTypes.STRING,
      companyCode: DataTypes.STRING,

      // personal data
      nik: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      full_name: DataTypes.STRING,
      avatar: DataTypes.STRING,
      phone: DataTypes.STRING,
      birthplace: DataTypes.STRING,
      birthday: DataTypes.DATE,
      gender: DataTypes.ENUM(['laki-laki', 'perempuan']),
      gaji: DataTypes.INTEGER,
      identity_number: DataTypes.STRING,
      address: DataTypes.TEXT,
      tanggal_gabung: DataTypes.DATE,

      is_login: DataTypes.BOOLEAN,
      first_login: DataTypes.BOOLEAN,
      is_verify: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Users',
    }
  );
  return Users;
};
