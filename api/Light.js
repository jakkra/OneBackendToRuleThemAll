'use strict';

const fetch = require('node-fetch');

  /**
   * @apiDefine Light Lights
   */
module.exports = (db, app, authenticate) => {

  /**
   * @api {post} /api/light/ Handle hue lights.
   * @apiGroup Light
   * @apiDescription
   * See Philips Hue light API for usage, this endpoint just passes the params to the hue server.
   *
   * @apiParam {String} url The url to philips hue servers.
   * @apiParam {Object} body The payload passed on to Philips hue server.
   * @apiSuccess {Bool} success Containing success or failure.
   */
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


   /**
   * @api {get} /api/light/ Get the state of your Philips Hue.
   * @apiGroup Light
   * @apiDescription
   * Lists the state of all lights and groups.
   *
   * @apiSuccess {Object} lights Lights and groups containing the lights and groups states.
   */
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
 * @param {Object} response, the json received from the server.
 * *return {Object} response if no error, the same object passed as argument.
 */
function checkStatus(response) {
  if (response.status === 200) {
    return response;
  }
  const error = new Error();
  error.response = response;
  throw error;
}
