'use strict';

const gcm = require('node-gcm');

const minutes = 1, interval = minutes * 60 * 1000;
let lastCheck = null;
const sender = new gcm.Sender(process.env.SERVER_GCM_API_KEY);

module.exports = (db, app, authenticate) => {

  app.post('/api/surveillance', authenticate, (req, res) => {
    if (!req.body.time) {
      return res.json({
        success: false,
        error: 'Invalid parameters.',
      });
    }
    console.log(req.user.atHome, req.body.time)
    const log = {
      wasAtHome: req.user.atHome,
      time: req.body.time,
    }

    db.Surveillance.create(log).then((log) => {
      console.log('----created log----', log);
      req.user.addSurveillance(log).then(() => {
        res.json({
          success: true,
          userWasAtHome: req.body.atHome,
          message: 'Successfully warned about motion.',
        });

        if (req.user.atHome === false) {
          const message = new gcm.Message({
            data: {
              type: 'surveillance',
              message: 'Motion detected at home',
              //collapseKey: 1,
            }
          });
          sender.send(message, { to: req.user.deviceToken }, function(err, response) {
            if (err) {
              console.error(err);
            } else {
              console.log(response);
            }
          });
        }
      });
    }).catch((error) => res.json({ success: false, message: error }));
  });
};
