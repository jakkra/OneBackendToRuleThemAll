'use strict';

const express = require('express'),
  db 			    = require('./models'),
  bodyParser 	= require('body-parser'),
  jwt 			  = require('jsonwebtoken');

const app = express();

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

    // verifies secret, ignores expiration for now.
    jwt.verify(token, process.env.SERVER_SECRET, { ignoreExpiration: true }, function(err, decoded) {
      if (err) {
        console.log('error authenticate', err);
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        req.token = token;
        db.User.find({
          where: {
            accessToken: token
          }
        }).then((user) => {
          if (user) {
            req.user = user;
            next();
          } else {
            res.json({ success: false, error: 'unauthorized' });
          }

        }).catch((error) => res.json({ success: false, error: 'User not found' }));
      }
    });

  } else {
    // if there is no token
    // return an error
    console.log('error authenticate, no token');
    return res.status(403).send({
      success: false,
      message: 'No token provided.',
    });
  }
}

require('./api/User')(db, app, authenticate),
require('./api/Reminder')(db, app, authenticate);
require('./api/Temperature')(db, app, authenticate);
require('./api/Light')(db, app, authenticate);
require('./api/Surveillance')(db, app, authenticate);


db.sequelize.sync().then(function() {
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/api', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// Notifications
require('./lib/NotificationHandler')(db, app);
