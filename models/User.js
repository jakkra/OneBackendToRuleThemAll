'use strict';
module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    accessToken: DataTypes.STRING,
  }, {
  });
  return User;
};