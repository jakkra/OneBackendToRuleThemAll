'use strict';

var bigInt = require('big-integer');

module.exports = (db, app, authenticate) => {

   /**
   * @api {post} /api/temperature Create a temperature logging.
   * @apiGroup Temperature
   * @apiDescription
   * Creates a temperature log.
   *
   * Possible errorcodes:
   * @apiParam {String} temperature The temperature to store.
   * @apiParam {String} [name] The tag on this temperature logging, needed if to separate tempeartures if more than one source.
   * @apiUse successObj
   * @apiUse errorObj
   * @apiSuccess {Object} Containing success or failure.
   */
  app.post('/api/temperature', authenticate, (req, res) => {
    if (!req.body.temperature) {
      return res.json({
        success: false,
        message: 'Invalid parameters.',
      });
    }
    let log;
    if (req.body.name) {
      log = {
        temperature: req.body.temperature,
        name: req.body.name
      };
    } else {
      log = { temperature: req.body.temperature };
    }

    db.Temperature.create(log).then((createdTemperature) => {
      req.user.addTemperature(createdTemperature).then(() => {
        res.json({
          success: true,
          message: 'Successfully added new temperature logging.',
        });
      });
    }).catch((error) => res.json({ success: false, message: error }));
  });

   /**
   * @api {get} /api/temperature List temperature logsgings.
   * @apiGroup Temperature
   * @apiDescription
   * Lists temperature loggings. This endpoint lets you specify
   * how many results over a given time to return. The result will
   * reduce the temperatures by grouping them and calculate the average.
   *
   * Example: Get all temperatures the last week.
   * { count: 7, unit: 'days' }
   *
   * Example: Get all temperatures between 2016-08-02 09:00:+00 and 2016-08-02 11:00+00
   * { endDate: 2016-08-02 11:00+00, count: 2, unit: 'hours' }
   *
   * Note, if only one of { count, unit } is specified, the filter will be ignored, all temperatures will be returned.
   *
   * Possible errorcodes:
   * @apiParam {Integer} [limit] The number temperatures to return.
   * @apiParam {String} [endDate=now] The date of the last temperature logging.
   * @apiParam {String} [unit] The unit to work with. One of: { days, hours, minutes }
   * @apiParam {String} [count] The number of units backwards from endDate.
   * @apiUse successObj
   * @apiUse errorObj
   * @apiSuccess {Array} List of tempareture loggings.
   */
  app.get('/api/temperature', authenticate, (req, res) => {
    if (req.query.count && req.query.unit) {
      let end = new Date();
      if (req.query.endDate) {
        end = new Date(req.query.endDate);
      }
      const start = new Date(end);
      switch (req.query.unit) {
        case 'days':
          start.setDate(start.getDate() + 1 - req.query.count);
          start.setHours(start.getHours() - 24);
          break;
        case 'hours':
          start.setHours(start.getHours() - req.query.count);
          break;
        case 'minutes':
          start.setMinutes(start.getMinutes() - req.query.count);
          break;
        default:
          return res.json({ success: false, error: 'Invalid params' });
      }

      req.user.getTemperatures({
        where: {
          createdAt: {
            $gt: start,
            $lt: end,
          },
        },
        order: [['createdAt']],
      }).then((temperatures) => {
        let temps = temperatures;
        if (req.query.limit) {
          temps = averageOutTemperatures(temps, req.query.limit);
        }
        res.json({ temperatures: temps, success: true });
      }).catch((error) => res.json({ success: false, error: error + ' ' }));
    } else {
      req.user.getTemperatures({ order: [['createdAt']] }).then((temperatures) => {
        res.json({ temperatures: averageOutTemperatures(temperatures, 100), success: true });
      });
    }
  });
};
 /**
 * Groups temperatures and calculates an average of each group. The loss of accuracy
 * will depend on the size of count compared to the length of the data.
 *
 * @param {Array} temps List of temperatures.
 * @param {String} count The number of themperatures to reduce the original data to.
 * @return {Array} List of temperatures.
 */
function averageOutTemperatures(temps, count) {
  const numTemps = temps.length;
  if (numTemps < count) { return temps; }
  const numToAverage = Math.floor(numTemps / count);
  let innerLoopLimit = numToAverage;
  let avgTime = bigInt();
  let avgTemp = 0;
  const result = [];
  // let tempDateTime = 0;

  for (let i = 0; i < temps.length; i += numToAverage) {
    if (i + numToAverage > temps.length) {
      innerLoopLimit = temps.length - i - 2;
    }
    for (let j = 0; j < innerLoopLimit; j++) {
      avgTime = avgTime.add(new Date(temps[i + j].createdAt).getTime());
      avgTemp += parseFloat(temps[i + j].temperature);
    }

    avgTime = avgTime.divide(innerLoopLimit);
    avgTemp = avgTemp / innerLoopLimit;
    const element = {
      temperature: Math.round(avgTemp * 10) / 10,
      createdAt: new Date(avgTime).toUTCString(),
      UserEmail: temps[0].UserEmail,
      id: i,
    };
    result.push(element);
    avgTemp = 0;
    avgTime = bigInt.zero;
  }

  return result;
}
