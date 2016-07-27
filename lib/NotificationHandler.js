'use strict';

const gcm = require('node-gcm');

const minutes = 1, interval = minutes * 60 * 1000;
let lastCheck = null;
const sender = new gcm.Sender(process.env.SERVER_GCM_API_KEY);

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
    reminders.map((reminder) => {
      const message = new gcm.Message({
        data: {
          type: 'reminder',
          reminder: reminder,
          collapseKey: reminder.id,
          message: reminder.title,
        },
        notification: {
          title: 'Reminder'
        }
      
      });
      const user = reminder.getUser().then((user) => {
        console.log('sending to user:', user.email);
        if (user.deviceToken !== null) {

          sender.send(message, { to: user.deviceToken }, function(err, response) {
            if (err) {
              console.error(err);
            } else {
              console.log(response);
            }
          });
        }
      }).catch((error) => console.log('user not found', error));

    });
    lastCheck = nextCheck;
  });
}

