'use strict';

const fetch = require('node-fetch');
const fs = require('fs');
const sharp = require('sharp');
var path = require('path');

  /**
   * @apiDefine Get APOD
   */
module.exports = (db, app, authenticate) => {

  /**
   * @api {get} /api/apod/latest Get info about the latest APOD
   * @apiGroup APOD
   * @apiDescription
   * Get info about the latest APOD picture
   *
   * Possible errorcodes:
   * @apiSuccess {Object} data Object containing name of the latest image and and url to download it from.
   */
  app.get('/api/apod/latest', (req, res) => {
    fetch('https://api.nasa.gov/planetary/apod?api_key=key')
    .then((response) => checkStatus(response))
    .then((response) => response.json())
    .then((json) => downloadApodImage(json, res))
    .catch((error) => res.json({ success: false, error: error }));
  });

  /**
   * @api {get} /api/apod/apod:filePath Get APOD picture by name
   * @apiGroup APOD
   * @apiDescription
   * Get APOD picture by name
   *
   * Possible errorcodes:
   * @apiParam {String} path path/name of the APOD image to get
   * @apiSuccess {Object} jpg file
   */
  app.get('/api/apod/:path', (req, res) => {
    if (!req.params.path) {
      return res.json({ success: false, error: 'Missing param path' });
    }
    fs.readFile(req.params.path, function(err, data) {
      if (err) {
        res.json({ success: false, error: 'No such image'});
      } else {
        res.contentType('image/jpg');
        res.send(data);
      }
    });
  });

};

function downloadApodImage(fileInfo, res) {
  const fileName = path.basename(fileInfo.url);
  fs.exists(fileName, function(exists) {
    if (!exists) {
      fetch(fileInfo.url)
      .then((response) => {
        return new Promise((resolve, reject) => {
          const fileWriteStream = fs.createWriteStream(fileName);
          const transform = sharp()
          .resize(64, 32)
          .toFormat('jpg');

          response.body.pipe(transform).pipe(fileWriteStream);

          response.body.on('error', (err) => {
            reject(err);
          });
          transform.on('error', (err) => {
            reject(err);
          });
          fileWriteStream.on('error', (err) => {
            reject(err);
          });
          fileWriteStream.on('finish', () => {
            resolve();
          });
        });
      })
      .then(() => res.json({ success: true, path: fileName }))
      .catch((error) => console.log(error));
    } else {
      res.json({ success: true, path: fileName });
    }
  });
}
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
