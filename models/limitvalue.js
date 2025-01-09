'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LimitValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LimitValue.belongsTo(models.Users, { foreignKey: 'user_id' });
    }
  }
  LimitValue.init(
    {
      user_id: DataTypes.INTEGER,
      saldo_limit: DataTypes.FLOAT,
      saldo_terpakai: DataTypes.FLOAT,
      status: DataTypes.ENUM(['AKTIF', 'KONFIRMASI', 'TIDAK-AKTIF', 'DITOLAK']),
      tanggal_diajukan: DataTypes.DATE,
      diajukan_oleh: DataTypes.INTEGER,
      tanggal_disetujui: DataTypes.DATE,
      disetujui_oleh: DataTypes.INTEGER,
      alasan: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'LimitValue',
      tableName: 'LimitValue',
    }
  );
  return LimitValue;
};
