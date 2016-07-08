'use strict';

module.exports = (db, app, authenticate) => {

  app.post('/api/reminder/create', authenticate, (req, res) => {
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
    reminder.time = toUTC.getTime() + toUTC.getTimezoneOffset() * 60 * 1000; //Convert date to UTC before storing it.

    db.Reminder.create(reminder).then((createdReminder) => {
      req.user.addReminder(createdReminder).then(() => {
        res.json({
          success: true,
          message: 'Successfully added reminder.',
        });
      });
    }).catch((error) => res.json({ success: false, message: error }));
  });

  app.get('/api/reminder/list', authenticate, (req, res) => {
    req.user.getReminders({ order: [['time']] }).then((reminders) => {
      res.json(reminders);
    });
  });

  app.put('/api/reminder/edit', authenticate, (req, res) => {

    db.Reminder.find({
      where: {
        id: req.body.id,
        UserEmail: req.user.email,
      }
    }).then((reminder) => {
      if (!reminder) {
        return res.json({
          success: false,
          message: 'Couldn\'t find the reminder',
        });
      }

      // Update user if parameters sent
      reminder.title = (req.body.title !== undefined) ? req.body.title : reminder.title;
      reminder.time = (req.body.time !== undefined) ? req.body.time : reminder.time;
      reminder.completed = (req.body.completed !== undefined) ? req.body.completed : reminder.completed;
      reminder.reminderActive = (req.body.reminderActive !== undefined) ? req.body.reminderActive : reminder.reminderActive;
      reminder.deleted = (req.body.deleted !== undefined) ? req.body.deleted : reminder.deleted;

      reminder.save();
      res.json({
        success: true,
        message: 'Reminder successfully updated',
        reminder: reminder,
      });
    });
  });
};
