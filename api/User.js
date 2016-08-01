'use strict';

module.exports = (db, app, authenticate) => {
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcrypt-nodejs');

  app.post('/api/user/create', (req, res) => {
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };

    if (!user.name || !user.email || !user.password) {
      return res.json({
        success: false,
        message: 'Invalid parameters.',
      });
    }
    db.User.find({ where: { email: req.body.email }}).then((foundUser) => {
      if (foundUser) {
        return res.json({
          success: false,
          message: 'Email already exists.',
        });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (!err) {
              user.password = hash;
              db.User.create(user).then((createdUser) => {
                res.json({
                  success: true,
                  message: 'Successfully added user.',
                });
              }).catch((error) => {
                return res.json({
                  success: false,
                  message: error,
                });
              });
            } else {
              return res.json({
                success: false,
                message: err,
              });
            }
          });
        });
      }
    });
  });

  app.get('/api/user', authenticate, (req, res) => {
    return res.json(req.user);
  });

  app.post('/api/user/authenticate', (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.json({
        success: false,
        message: 'missing fields',
      });
    }
    // find the user
    db.User.findOne({
      where: {
        email: req.body.email,
      }
    }).then((user) => {
      // check if password matches
      bcrypt.compare(req.body.password, user.password, function(err, result) {
        if (result === false) {
          return res.json({
            success: false,
            message: 'Authentication failed. Wrong password.'
          });
        } else {
          // if user is found and password is right
          // create a token
          const token = jwt.sign(req.body.email, process.env.SERVER_SECRET, {
          });
          user.accessToken = token;
          user.save().then(() => {
            return res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token,
            });
          });
        }
      });
    }).catch((error) => res.json({
      success: false,
      message: 'Authentication failed. User not found.' + error,
    }));
  });


  app.post('/api/user/device', authenticate, (req, res) => {
    if (!req.body.deviceToken) {
      return res.json({
        success: false,
        message: 'invalid parameters',
      });
    }

    // Update user if parameters sent
    req.user.deviceToken = (req.body.deviceToken !== undefined) ? req.body.deviceToken : req.user.deviceToken;
    req.user.save();
    res.json({
      success: true,
      message: 'Reminder successfully added deviceToken',
    });
  });

  app.put('/api/user/edit', authenticate, (req, res) => {
    console.log('----------------------/api/user/edit');
    console.log(req.body);

    // Update user if parameters sent
    req.user.name = (req.body.name !== undefined) ? req.body.name : req.user.name;
    req.user.password = (req.body.password !== undefined) ? req.body.password : req.user.password;
    req.user.atHome = (req.body.atHome !== undefined) ? req.body.atHome : req.user.atHome;

    req.user.save();
    res.json({
      success: true,
      message: 'User successfully updated',
    });
  });


};
