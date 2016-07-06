'use strict';

module.exports = (db, app, authenticate) => {

  app.post('/api/reminder/create', authenticate, (req, res) => {
    console.log('reminder', req.body);

    const reminder = {
      title: req.body.title,
      time: req.body.time,
      reminderActive: Boolean(req.body.reminderActive),
    };
    if (!reminder.title || !reminder.time || !reminder.reminderActive) {
      return res.json({
        success: false,
        message: 'Invalid parameters.',
      });
    }
    const toUTC = new Date(reminder.time);
    reminder.time = toUTC.getTime() + toUTC.getTimezoneOffset() * 60000; //Convert date to UTC before storing it.
    db.User.find({
      where: {
        accessToken: req.token
      }
    }).then((user) => {
      db.Reminder.create(reminder).then((createdReminder) => {
        console.log('created reminder', createdReminder);
        user.addReminder(createdReminder).then(() => {
          res.json({
            success: true,
            message: 'Successfully added reminder.',
          });
        });
      });
    }).catch((error) => res.json({ success: false, message: error }));
  });

  app.get('/api/reminder/list', authenticate, (req, res) => {
    db.User.find({
      where: {
        accessToken: req.token
      }
    }).then((user) => {
      user.getReminders({ order: [['time', 'DESC']] }).then((reminders) => {
        res.json(reminders);
      });
    });
  });
};
