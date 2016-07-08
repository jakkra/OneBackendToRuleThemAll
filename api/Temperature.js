'use strict';

module.exports = (db, app, authenticate) => {

  app.post('/api/temperature', authenticate, (req, res) => {
    if (!req.body.temperature) {
      return res.json({
        success: false,
        message: 'Invalid parameters.',
      });
    }

    db.Temperature.create({temperature: req.body.temperature}).then((createdTemperature) => {
      req.user.addTemperature(createdTemperature).then(() => {
        res.json({
          success: true,
          message: 'Successfully added new temperature logging.',
        });
      });
    }).catch((error) => res.json({ success: false, message: error }));
  });

  app.get('/api/temperature', authenticate, (req, res) => {
  	console.log(req.user)
    req.user.getTemperatures({ order: [['createdAt']] }).then((temperatures) => {
      res.json({ temperatures: temperatures, succes: true });
    });
  });

};
