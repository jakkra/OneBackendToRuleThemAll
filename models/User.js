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
    deviceToken: DataTypes.STRING,
    atHome: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    hueBridgeId: DataTypes.STRING,
    hueBridgeToken: DataTypes.STRING,
  },
    {
      instanceMethods: {
        toJSON: function() {
          var values = this.get();

          delete values.password;
          return values;
        }
      }
    });
  return User;
};
