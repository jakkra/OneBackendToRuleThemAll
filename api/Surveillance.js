'use strict';

const gcm = require('node-gcm');

const sender = new gcm.Sender(process.env.SERVER_GCM_API_KEY);

  /**
   * @apiDefine Surveillance Surveillance
   */
module.exports = (db, app, authenticate) => {


  /**
   * @api {post} /api/surveillance Log movement.
   * @apiGroup Surveillance
   * @apiDescription
   * Logs movements/motion detected.
   *
   * Possible errorcodes:
   * @apiParam {String} time The time the motion occured.
   * @apiSuccess {Bool} success Containing success or failure.
   */
  app.post('/api/surveillance', authenticate, (req, res) => {
    if (!req.body.time) {
      return res.json({
        success: false,
        error: 'Invalid parameters.',
      });
    }
    const log = {
      wasAtHome: req.user.atHome,
      time: req.body.time,
    };

    db.Surveillance.create(log).then((log) => {
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

  /**
   * @api {get} /api/surveillance List all motion detected logs.
   * @apiGroup Surveillance
   * @apiDescription
   * Lists all logs of motion detected.
   *
   * Possible errorcodes:
   * @apiParam {Bool} wasAtHome If the result should contain logs when the user was/wasn't at home.
   * @apiSuccess {Array} logs List of motion logs.
   */
  app.get('/api/surveillance', authenticate, (req, res) => {
    let filter;
    if (req.query.wasAtHome) {
      const wasAtHome = req.query.wasAtHome === 'true' ? true : false;
      filter = {
        where: {
          wasAtHome: wasAtHome,
        },
        order: [['createdAt', 'DESC']]
      };
    } else {
      filter = {
        order: [['createdAt', 'DESC']]
      };
    }
    req.user.getSurveillances(filter)
    .then((logs) => {
      res.json({ success: true, logs: logs });
    })
    .catch((error) => res.json({ success: false, error: error }));
  });
};
