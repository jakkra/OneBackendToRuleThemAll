'use strict';

const minutes = 1, interval = minutes * 60 * 1000;
let lastCheck = null;
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
    //reminders.map((reminder) => console.log(reminder));
    lastCheck = nextCheck;
  });
}

