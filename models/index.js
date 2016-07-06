var Sequelize = require('sequelize')
  , sequelize = null

if (process.env.DATABASE_URL) {
  // the application is executed on Heroku ... use the postgres database
  var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    logging:  true //false
  })
} else {
  // the application is executed on the local machine ... use mysql
  sequelize = new Sequelize('reminders', 'root', null)
}

global.db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  User:      sequelize.import(__dirname + '/User'),
  Reminder:  sequelize.import(__dirname + '/Reminder') 
}


//Associations can be defined here. E.g. like this:
global.db.User.hasMany(global.db.Reminder)
global.db.Reminder.belongsTo(global.db.User);


module.exports = global.db