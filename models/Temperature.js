'use strict';
module.exports = function(sequelize, DataTypes) {
  const Temperature = sequelize.define('Temperature', {
    temperature: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      defaultValue: 'inside',
    },
    time: {
      type: DataTypes.DATE,
      defaultValue: sequelize.NOW
    }
  });
  return Temperature;
};
