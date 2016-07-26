'use strict';
module.exports = function(sequelize, DataTypes) {
  const Temperature = sequelize.define('Temperature', {
    temperature: DataTypes.STRING,
    name: {
    	type: DataTypes.STRING,
      defaultValue: 'inside',
    }
  });
  return Temperature;
};
