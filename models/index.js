'use strict';
const Sequelize = require('sequelize');
let sequelize = null;

if (process.env.DATABASE_URL) {
  // the application is executed on Heroku ... use the postgres database
  const match = process.env.DATABASE_URL
  .match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    logging:  true,
  });
} else {
  // the application is executed on the local machine ... use mysql
  sequelize = new Sequelize('reminders', 'root', null);
}

global.db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  User:      sequelize.import(__dirname + '/User'),
  Reminder:  sequelize.import(__dirname + '/Reminder'),
  Temperature:  sequelize.import(__dirname + '/Temperature'),
  Surveillance:  sequelize.import(__dirname + '/Surveillance'),
};


global.db.User.hasMany(global.db.Reminder);
global.db.Reminder.belongsTo(global.db.User);

global.db.User.hasMany(global.db.Temperature);
global.db.Temperature.belongsTo(global.db.User);

global.db.User.hasMany(global.db.Surveillance);
global.db.Surveillance.belongsTo(global.db.User);

global.db.sequelize.sync().then(function() {
  console.log('Synced');
}).catch((error) => console.log(error));

module.exports = global.db;
