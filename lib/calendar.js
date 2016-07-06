'use strict'

const google 			= require('googleapis');
const googleAuth 	= require('google-auth-library');
const calendar 		= google.calendar('v3');

module.exports = {
  listEvents: function listEvents() {
    authorize(_listEvents)
  },
  createEvent: function createEvent(event){
  	authorize(_createEvent, event);
  }
};

function _listEvents(auth){
  calendar.events.list({
    auth: auth,
    calendarId: 'nfv80f4rc8vffv09g5cr0alt5g@group.calendar.google.com',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ', err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
    } else {
      console.log('Upcoming 10 events:');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        console.log('%s - %s', start, event.summary);
        console.log(event)
      }
    }
  });
}

function _createEvent(auth, event){
	let endTime = new Date(event.time);
	endTime.setHours(endTime.getHours() + 1);
	console.log('startTime', event.time);
	console.log('endTime', endTime)
  var event = {
	  'summary': 'Kom ihåg: ' + event.title,
	  'description': '',
	  'start': {
	    'dateTime': event.time,
	    'timeZone': 'Europe/Stockholm',
	  },
	  'end': {
	    'dateTime': endTime.toISOString().slice(0, -1), //Slice the 'Z', since the time is already in correct timezone
	    'timeZone': 'Europe/Stockholm',
	  },
	  'reminders': {
	    'useDefault': false,
	    'overrides': [
	      {'method': 'popup', 'minutes': 0},
	    ],
	  },
	};

	calendar.events.insert({
	  auth: auth,
	  calendarId: 'nfv80f4rc8vffv09g5cr0alt5g@group.calendar.google.com',
	  resource: event,
	}, function(err, event) {
	  if (err) {
	    console.log('There was an error contacting the Calendar service: ' + err);
	    return;
	  }
	  console.log('Event created: %s', event.htmlLink);
	});
}

function authorize(callback, params) {
    var SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.readonly' ];
    var private_value = process.env.SERVICE_KEY.replace(/\\n/g, '\n');

    var jwtClient = new google.auth.JWT(process.env.SERVICE_MAIL, null, private_value, SCOPES, null);

    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.log('error', err);
        return;
      } 
      	callback(jwtClient, params)
      
    });
  }
  