'use strict';
module.exports = function(sequelize, DataTypes) {
  const Surveillance = sequelize.define('Surveillance', {
    wasAtHome: DataTypes.BOOLEAN,
    time: DataTypes.DATE,
  });
  return Surveillance;
};
