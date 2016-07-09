'use strict';

const gcm = require('node-gcm');

const minutes = 1, interval = minutes * 60 * 1000;
let lastCheck = null;
const sender = new gcm.Sender('AIzaSyC7mrWJQ4OJD1dST4d0JVoaQBeK_hcdVX0');

module.exports = function(db, app) {

  findReminders(db);
  setInterval(function() {
    findReminders(db);
  }, interval);
};

function findReminders(db) {
  const nextCheck = new Date(new Date().getTime() + interval);
  if (lastCheck === null) {
    lastCheck = new Date();
    lastCheck = new Date(lastCheck.getTime());
  }
  db.Reminder.findAll({
    where: {
      time: {
        $gt: lastCheck,
        $lte: nextCheck,
      },
      reminderActive: true,
    }
  }).then((reminders) => {
    // TODO get device tokens and send notification to device
    console.log('----------result-----', reminders);
    reminders.map((reminder) => {
      const message = new gcm.Message({
        data: { title: reminder.title },
        notification: {
          title: "Hello, World",
          icon: "ic_launcher",
          body: "This is a notification that will be displayed ASAP."
        }
      });
      const user = reminder.getUser().then((user) => {
        console.log('sending to user:', user);
        if (user.deviceToken !== null) {

          sender.send(message, { to: user.deviceToken }, function(err, response) {
            if (err) console.error(err);
            else cosnole.log(response);
          });
        }
      }).catch((error) => console.log('user not found', error));

    });
    lastCheck = nextCheck;
  });
}

