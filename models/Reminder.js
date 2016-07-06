'use strict';
module.exports = function(sequelize, DataTypes) {
  const Reminder = sequelize.define('Reminder', {
    title: DataTypes.TEXT,
    time: DataTypes.DATE,
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reminderActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Reminder;
};
