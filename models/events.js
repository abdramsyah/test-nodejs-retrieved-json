'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Events extends Model {
    static associate(models) {
      Events.hasMany(models.Products, { foreignKey: 'event_id' });
    }
  }
  Events.init(
    {
      event_name: DataTypes.STRING,
      slug: DataTypes.STRING,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      // is_active: DataTypes.BOOLEAN,
      // event_id: DataTypes.INTEGER,
      prioritas: DataTypes.INTEGER,
      status: DataTypes.STRING,
      deleted_at: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Events',
      tableName: 'Events',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Events;
};
