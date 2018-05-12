'use strict';
var sys = require('sys')
var exec = require('child_process').exec;
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/storage/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'NodeReminder.json';
console.log(TOKEN_DIR, TOKEN_PATH);

let oauth2Client;

module.exports = {
  // Load client secrets from a local file.
  init: function() {
      const content = {
        client_secret: process.env.client_secret,
        client_id: process.env.client_id,
        redirect_uris: [process.env.redirect_uris],
      }
      // Authorize a client with the loaded credentials, then call the
      // Gmail API.
      authorize(content);
  },

  getNumUnreadMail: function(callback) {
    var gmail = google.gmail('v1');
    gmail.users.labels.get({
      auth: oauth2Client,
      userId: 'me',
      id: 'INBOX',
      labelIds: 'UNREAD'
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return 0;
      }
      console.log("Unread: " + response.messagesUnread);
      callback(response.messagesUnread);
    });
  }
};



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
  console.log(credentials);
  var clientSecret = credentials.client_secret;
  var clientId = credentials.client_id;
  var redirectUrl = credentials.redirect_uris[0];
  var auth = new googleAuth();
  oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken();
    } else {
      oauth2Client.credentials = JSON.parse(token);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken() {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}




