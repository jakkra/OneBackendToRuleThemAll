'use strict';

var bigInt = require('big-integer');

module.exports = (db, app, authenticate) => {

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
