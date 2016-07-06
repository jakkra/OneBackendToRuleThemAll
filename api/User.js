'use strict';
module.exports = (Models, app, authenticate) => {
  const jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt-nodejs');

  app.post('/api/user/create', (req, res) => {
    console.log('request', req.body);
      const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      };

      if (!user.name || !user.email || !user.email) {
        return res.json({
          success: false,
          message: 'Invalid parameters.',
        });
      }

    db.User.create(user).then((createdUser) => {
      console.log(createdUser);
      res.json({
        success: true,
        message: 'Successfully added user.',
      });
    }).catch((error) => {
      return res.json({
          success: false,
          message: 'Email already exists.',
        });
    });
  });

  app.get('/api/user/list', authenticate,  (req, res) => {
    db.User.findAll().then((users) => {
      res.json(users);
    });
  });

  app.post('/api/user/authenticate', (req, res) => {
    // find the user
    db.User.find({
      where: {
        email: req.body.email
      }
    }).then((user) => {
      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(req.body.email, process.env.SERVER_SECRET, {
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      
      }
    }).catch((error) => res.json({ success: false, message: 'Authentication failed. User not found.' }));
  });
}