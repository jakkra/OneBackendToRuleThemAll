'use strict';
module.exports = function (sequelize, DataTypes) {
  const Reminder = sequelize.define('Reminder', {
    title: DataTypes.TEXT,
    time: DataTypes.DATE,
  });

  return Reminder;
};