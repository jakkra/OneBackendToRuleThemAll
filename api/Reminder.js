'use strict';

module.exports = (db, app, authenticate) => {

   /**
   * @api {post} /api/reminder/create Create a new reminder
   * @apiGroup Reminder
   * @apiDescription
   * Creates a new reminder.
   *
   * Possible errorcodes:
   * @apiParam {String} title The title of the reminder.
   * @apiParam {String} [time] The time the reminder startes, also the time when the server will notify.
   * @apiParam {String} reminderActive Should the server notify when this event occurs.
   * @apiUse successObj
   * @apiUse errorObj
   * @apiSuccess {Object} Containing success or failure.
   */
  app.post('/api/reminder/create', authenticate, (req, res) => {
    const reminder = {
      title: req.body.title,
      time: req.body.time,
      reminderActive: Boolean(req.body.reminderActive),
    };
    if (!reminder.title || !reminder.reminderActive) {
      return res.json({
        success: false,
        message: 'Invalid parameters.',
      });
    }
    if (reminder.time) {
      const toUTC = new Date(reminder.time);
      reminder.time = toUTC.getTime() + toUTC.getTimezoneOffset() * 60 * 1000; //Convert date to UTC before storing it.
    }

    db.Reminder.create(reminder).then((createdReminder) => {
      req.user.addReminder(createdReminder).then(() => {
        res.json({
          success: true,
          message: 'Successfully added reminder.',
        });
      });
    }).catch((error) => res.json({ success: false, message: error }));
  });

  /**
   * @api {get} /api/reminder/list List all reminders.
   * @apiGroup Reminder
   * @apiDescription
   * Lists all reminders.
   *
   * Possible errorcodes:
   * @apiUse successObj
   * @apiUse errorObj
   * @apiSuccess {Array} reminder List of the reminders.
   */
  app.get('/api/reminder/list', authenticate, (req, res) => {
    req.user.getReminders({ order: [['time']] }).then((reminders) => {
      res.json(reminders);
    });
  });

  /**
   * @api {put} /api/reminder/edit Edit an existing reminder.
   * @apiGroup Reminder
   * @apiDescription
   * Edits an existing reminder.
   *
   * Possible errorcodes:
   * @apiParam {String} [title] The title of the reminder.
   * @apiParam {String} [time] The time the reminder startes, also the time when the server will notify.
   * @apiParam {String} [reminderActive] Should the server notify when this event occurs.
   * @apiParam {String} [completed] Mark the reminder as compleated, the server will not send a push notification.
   * @apiParam {String} [deleted] Mark the reminder a deleted (doesn't actually delete it).

   * @apiUse successObj
   * @apiUse errorObj
   * @apiSuccess {Reminder} reminder The edited reminder.
   */
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
