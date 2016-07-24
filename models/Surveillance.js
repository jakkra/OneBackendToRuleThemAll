'use strict';
module.exports = function(sequelize, DataTypes) {
  const Temperature = sequelize.define('Surveillance', {
    wasAtHome: DataTypes.BOOLEAN,
    time: DataTypes.DATE,
  });
  return Temperature;
};
