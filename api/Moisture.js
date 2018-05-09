'use strict';

  /**
   * @apiDefine Moisture
   */
module.exports = (db, app, authenticate) => {

   /**
   * @api {post} /api/moisture Create a moisture logging.
   * @apiGroup Moisture
   * @apiDescription
   * Creates a moisture log.
   * Possible errorcodes:
   * @apiParam {String} moisture The moisture level to store.
   * @apiParam {Datetime} time the moisture level was logged
   * @apiParam {String} [name] The tag on this moisture logging,
   * needed if to separate moisture if more than one source.
   * @apiSuccess {Bool} success Containing success or failure.
   */
  app.post('/api/moisture', authenticate, (req, res) => {
    if (!req.body.moisture) {
      return res.json({
        success: false,
        message: 'Invalid parameters.',
      });
    }
    let log;
    if (req.body.name && req.body.time) {
      log = {
        moisture: req.body.moisture,
        name: req.body.name,
        time: req.body.time,
      };
    } else if (req.body.name) {
      log = {
        moisture: req.body.moisture,
        name: req.body.name,
      };
    } else if (req.body.time) {
      log = {
        moisture: req.body.moisture,
        time: req.body.time,
      };
    } else {
      log = { moisture: req.body.moisture };
    }

    db.Moisture.create(log).then((createdMoistureLog) => {
      req.user.addMoisture(createdMoistureLog).then(() => {
        res.json({
          success: true,
          message: 'Successfully added new moisture level logging.',
        });
      });
    }).catch((error) => res.json({ success: false, message: error }));
  });

   /**
   * @api {get} /api/moisture List moisture logsgings.
   * @apiGroup Moisture
   * @apiDescription
   * Lists all moisture loggings.
   * Possible errorcodes:
   * @apiSuccess {Array} moisture List of mositure loggings.
   */
  app.get('/api/moisture', authenticate, (req, res) => {
    req.user.getMoistures({
      order: [['time']],
    }).then((moistures) => {
      res.json({ moisture: moistures, success: true });
    }).catch((error) => res.json({ success: false, error: error + ' ' }));
  });

  /**
   * @api {get} /api/moisture/latest Get the latest moisture logging.
   * @apiGroup Moisture
   * @apiDescription
   * Get the latest moistue logging for one sources.
   * @apiParam {String} source The source key for the moisture source.
   * @apiSuccess {Array} moisture Array containing the latest logging for the source.
   */
  app.get('/api/moisture/latest', authenticate, (req, res) => {
    if (!req.query.source) {
      return res.json({
        success: false,
        message: 'Missing parameter source.',
      });
    }

    req.user.getMoistures({
      where: {
        name: req.query.source,
      },
      order: [['createdAt', 'DESC']],
      limit: 1,
    }).then((moisture) => {
      res.json({ moisture: moisture, success: true });
    }).catch((error) => res.json({ success: false, error: error + ' ' }));
  });

  /**
   * @api {get} /api/moisture/sources List all moisture sources.
   * @apiGroup Moisture
   * @apiDescription
   * List all moisture sources
   * @apiSuccess {Array} sources Array containing all mousrure logging sources.
   */
  app.get('/api/moisture/sources', authenticate, (req, res) => {
    req.user.getMoistures().then((moistures) => {
      const sources = Array.from(new Set(moistures.map(moisture => moisture.name)));
      res.json({ sources: sources, success: true });
    }).catch((error) => res.json({ success: false, error: error + ' ' }));
  });
};