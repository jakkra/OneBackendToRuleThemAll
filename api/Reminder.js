'use strict';

const calendar = require('../lib/calendar');

module.exports = (Models, app, authenticate) => {

  app.post('/api/reminder/create', authenticate, (req, res) => {
    const reminder = {
      title: req.body.title,
      time: req.body.time,
      UserEmail: req.body.email
    };
    console.log('reminder', req.body, reminder);

    if (!reminder.title || !reminder.time  || !reminder.UserEmail) {
      return res.json({
        success: false,
        message: 'Invalid parameters.',
      });
    }
    calendar.createEvent(reminder);


    db.Reminder.create(reminder).then((createdReminder) => {
      console.log('sdsdsdsdd created reminder', createdReminder);
      res.json({
        success: true,
        message: 'Successfully added reminder.',
      });
    }).catch((error) => console.log('failed to store reminder', error));
  });

  app.get('/api/reminder/list', authenticate, (req, res) => {
    db.Reminder.findAll()
    .then((reminders) => {
      res.json(reminders);
    });
  });
}
