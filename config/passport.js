// config/passport.js

// load all the things we need
var BasicStrategy = require('passport-http').BasicStrategy,
    User = require('../lib/models/user');

/**
 * Check if a string is an email
 * @param: {String} email - The text to check
 * @return: {boolean} True if email is an email
 */
function emailValidate(email) {
  // For now, return true if there is an @
  return (email.indexOf('@') !== -1);
}

/**
 * Merge new data with existing user
 * @param: {User} user - The user to check against
 * @param: {Object} The info to check
 */
function addInfo(user, info) {
  var part;
  
  for (part in info) {
    if (info.hasOwnProperty(part)) {
      if (info[part] && !user[part])
        user.set(part, info[part]);
    }
  }
}

// expose this function to our app using module.exports
module.exports = function(passport) {
  // set up BasicStrategy
  passport.use(new BasicStrategy(

  function(username, password, callback) {
    User.findOne({
      username: username
    }, function(err, user) {
      if (err) {
        return callback(err);
      }

      // No user found with that username
      if (!user) {
        return callback(null, false);
      }

      // Make sure the password is correct
      user.verifyPassword(password, function(err, isMatch) {
        if (err) {
          return callback(err);
        }

        // Password did not match
        if (!isMatch) {
          return callback(null, false);
        }

        // Success
        return callback(null, user);
      });
    });
  }));
};