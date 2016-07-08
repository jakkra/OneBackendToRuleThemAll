'use strict';
module.exports = function(sequelize, DataTypes) {
  const Temperature = sequelize.define('Temperature', {
    temperature: DataTypes.STRING,
  });
  return Temperature;
};
