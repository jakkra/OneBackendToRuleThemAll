'use strict';
module.exports = function(sequelize, DataTypes) {
  const Moisture = sequelize.define('Moisture', {
    moisture: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      defaultValue: 'default_plant',
    },
    time: {
      type: DataTypes.DATE,
      defaultValue: sequelize.NOW
    }
  });
  return Moisture;
};
