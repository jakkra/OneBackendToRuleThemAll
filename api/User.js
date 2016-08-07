'use strict';


  /**
   * @apiDefine User User
   */
module.exports = (db, app, authenticate) => {
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcrypt-nodejs');

  /**
   * @api {post} /api/user/create Create a new user.
   * @apiGroup User
   * @apiDescription
   * Creates a new user.
   *
   * Possible errorcodes:
   * @apiParam {String} email The user email.
   * @apiParam {String} name The name of the user.
   * @apiParam {String} password The passowrd.
   * @apiSuccess {Bool} success Containing success or failure.
   */
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

   /**
   * @api {get} /api/user List the user.
   * @apiGroup User
   * @apiDescription
   * Creates a new user.
   *
   * Possible errorcodes:
   * @apiSuccess {User} user The user.
   */
  app.get('/api/user', authenticate, (req, res) => {
    return res.json(req.user);
  });

   /**
   * @api {post} /api/user/authenticate Authenticate a user.
   * @apiGroup User
   * @apiDescription
   * Authenitcates a user.
   *
   * Possible errorcodes:
   * @apiParam {String} email The user email.
   * @apiParam {String} password The passowrd.
   * @apiSuccess {Object} token The access token to use when querying the server.
   */
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

   /**
   * @api {post} /api/user/device Store device token.
   * @apiGroup User
   * @apiDescription
   * Stores a device token which connects the user to a Android phone.
   * Used when sending push notifications.
   *
   * Possible errorcodes:
   * @apiParam {String} deviceToken The device token to connect to the user.
   * @apiSuccess {Bool} success Containing success or failure.
   */
  app.post('/api/user/device', authenticate, (req, res) => { // TODO change to put or combine with edit user
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

   /**
   * @api {put} /api/user/edit Edit an existing user.
   * @apiGroup User
   * @apiDescription
   * Edits an existing users attributes.
   *
   * Possible errorcodes:
   * @apiParam {String} [name] The name of the user.
   * @apiParam {String} [password] The password.
   * @apiParam {bool} [atHome] Set if the user is at home or not.
   * @apiSuccess {Bool} success Containing success or failure.
   */
  app.put('/api/user/edit', authenticate, (req, res) => {
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
