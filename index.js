'use strict'

const express 	= require('express'),
 db 			= require('./models'),
 app 			= express(),
 bodyParser 	= require('body-parser'),
 cal 			= require('./lib/calendar'),
 jwt 			= require('jsonwebtoken');


app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));

// Body parser
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// route middleware to verify a token
function authenticate(req, res, next) {

  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, process.env.SERVER_SECRET, {ignoreExpiration: true}, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
};

const userRouter 	= require('./api/User')(db, app, authenticate),
 reminderRouter 	= require('./api/Reminder')(db, app, authenticate);


db.sequelize.sync().then(function() {
    console.log('Express server listening on port ' + app.get('port'));
});

// route to show a random message (GET http://localhost:8080/api/)
app.get('/api', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

