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
    if (req.query.count && req.query.unit) {
      const start = new Date();
      switch (req.query.unit) {
        case 'days':
          start.setDate(start.getDate() - req.query.count);
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
            $lt: new Date(),
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
  console.log(numTemps, numToAverage);
  let avgTime = 0;
  let avgTemp = 0;
  const result = [];
  let tempDateTime = 0;

  for (let i = 0; i < temps.length; i += numToAverage) {
    if (i + numToAverage > temps.length) {
      innerLoopLimit = temps.length - i - 2;
    }
    for (let j = 0; j < innerLoopLimit; j++) {
      avgTemp += parseFloat(temps[i + j].temperature);
      tempDateTime = new Date(temps[i + j].createdAt).getTime();
      avgTime = (avgTime === 0) ? tempDateTime : (avgTime + tempDateTime) / 2;
    }
    avgTemp = avgTemp / numToAverage;
    const element = {
      temperature: Math.round(avgTemp * 10) / 10,
      createdAt: new Date(Math.round(avgTime)).toUTCString(),
      UserEmail: temps[0].UserEmail,
      id: i,
    };
    result.push(element);
    avgTemp = 0;
    avgTime = 0;
  }

  return result;
}
