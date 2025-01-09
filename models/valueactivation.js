'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ValueActivation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ValueActivation.init(
    {
      user_id: DataTypes.INTEGER,
      full_name: DataTypes.STRING,
      identity_number: DataTypes.STRING,
      nik: DataTypes.STRING,
      activation_status: DataTypes.ENUM([
        'NOT_REGISTRED',
        'WAITING_CONFIRM',
        'REGISTRED',
        // 'ACTIVATED',
        'REJECTED',
      ]),
      code_company: DataTypes.STRING,
      email: DataTypes.STRING,
      deleted_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'ValueActivation',
      tableName: 'ValueActivations',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return ValueActivation;
};
