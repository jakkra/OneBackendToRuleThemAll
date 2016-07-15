'use strict';

const fetch = require('node-fetch');

module.exports = (db, app, authenticate) => {

  app.post('/api/light', authenticate, (req, res) => {
    if (!req.body) {
      return res.json({
        success: false,
        error: 'invalid parameters.',
      });
    }
    /* 'const command = {
      'url' : req.body.url,
      'method' : 'PUT',
      'body' : {
        'on' : false
      }
    } */
    const url = req.body.url;
    const payloadcontent = 'clipmessage=' + JSON.stringify(
      {'bridgeId': process.env.BRIDGE_ID, 'clipCommand':
        { 'url': url, 'method': 'PUT', 'body': req.body}
      }, null, 4);

    fetch('https://www.meethue.com/api/sendmessage?token=' + process.env.BRIDGE_ACCESS_TOKEN, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      'body': payloadcontent,
    })
    .then((response) => checkStatus(response))
    .then((json) => res.json({success: true, message: 'lights changed'}))
    .catch((error) => res.json({ success: false, error: 'Something went wrong, invalid params most likely' }));
  });


  app.get('/api/light', authenticate, (req, res) => {
    fetch('https://www.meethue.com/api/getbridge?token=' +
      process.env.BRIDGE_ACCESS_TOKEN + '&bridgeId=' +
      process.env.BRIDGE_ID, {
        method: 'get',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      })
      .then((response) => checkStatus(response))
      .then((response) => response.json())
      .then((json) => res.json({ success: true, lights: json.lights, groups: json.groups }))
      .catch((error) => res.json({success: false, error: 'Something went wrong'}));
  });
};

/**
 * Checks if a response was successful, throws an error if it's not.
 * @param {Object} response, the json reseived from the server
 */
function checkStatus(response) {
  if (response.status === 200) {
    return response;
  }
  const error = new Error();
  error.response = response;
  throw error;
}
