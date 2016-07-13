'use strict';

const fetch = require('node-fetch');

module.exports = (db, app, authenticate) => {

  app.post('/api/light', authenticate, (req, res) => {
    if (!req.body.url && !req.body.params) {
      return req.json({
        success: false,
        error: 'invalid parameters.',
      })
    }
    console.log(req.body.url, req.body.params);
    const command = {
      // '/api/0/' is does not change.
      // Change 'lights/0/state' to another API address.(remove '/api/<usename>/')
      // Ex. '/api/0/api', '/api/0/lights', '/api/0/lights/new', '/api/0/lights/<id>', 
      'url' : req.body.url,
      'method' : 'PUT',
      'body' : {
        'on' : false
      }
    }
    const payloadcontent = 'clipmessage=' + JSON.stringify(
      {"bridgeId": process.env.BRIDGE_ID, "clipCommand": 
        { "url": req.body.url, "method": "PUT" , "body": req.body.params}
      }, null, 4);

    fetch('https://www.meethue.com/api/sendmessage?token=' + process.env.BRIDGE_ACCESS_TOKEN, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      'body': payloadcontent,
    })
    .then(response => checkStatus(response))
    .then(json => req.json({success: true, message: 'lights changed'}))
    .catch(error => req.json({ success: false, error: 'Something went wrong, invalid params most likely' }));
  });


  app.get('/api/light', authenticate, (req, res) => {
    fetch('https://www.meethue.com/api/sendmessage?token=' + process.env.BRIDGE_ACCESS_TOKEN + '&bridgeId=' + process.env.BRIDGE_ID, {
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    .then(response => checkStatus(response))
    .then(response => response.json())
    .then(json => req.json({success: true, payload: {lights: json.lights, groups: json.groups}}))
    .catch(error => req.json({success: false, error: 'Something went wrong'}));
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