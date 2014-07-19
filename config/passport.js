// config/passport.js

// load all the things we need
var BasicStrategy = require('passport-http').BasicStrategy,
    User = require('../lib/models/user');
    //configAuth = require('./auth');

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


/*
OTHER STRATEGY FUNCTIONS (turned off for REST)
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Update a user w/ FB info
function facebookUser(user, token, profile, username) {
  user.facebook.token  = token;
  // Add info to user, if it's new
  addInfo(user,{
    username: username,
    email: profile.emails[0].value,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName
  });
}
// Update a user w/ info
function twitterUser(user, token, profile, username) {
  user.twitter.token  = token;
  // Add info to user, if it's new
  addInfo(user,{
    username:  username,
    fullName: profile.displayName
  });
}
function googleUser(user, token, profile, username) {
  user.google.token  = token;
  // Add info to user, if it's new
  addInfo(user,{
    username:  username,
    email:  profile.emails[0].value,
    fullName: profile.name.displayName,
  });
}

/**
 * Generate a unique username from a given one
 * @param: {String} username - given name
 * @param: {String} callback - callback to pass the name to
 * @param: {String || integer} n - Number to append to name. Start with ''
function uniqueName(username, callback, n) {
  // Set an undefined n to blank
  if (!n) n='';
  
  User.findOne({
    'username': username + n
  }, function (err, user) {
    // If user exists:
    if (user) {
      // If this was the fisrt try (and n is blank)
      if (!n) {
        // Call with n as 1 (so user becomes user1)
        uniqueName(username, callback, 1);
      } else {
        // Call with n++
        uniqueName(username, callback, n+1);
      }
    // when username + n is unique
    } else {
      // pass the new username to the callback
      callback(username + n);
    }
      
  });
}

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

// =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },

  function(req, username, password, done) {

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({
        'username': username
      }, function(err, user) {
        // if there are any errors, return the error
        if (err) return done(err);

        // check to see if theres already a user with that name
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
        }
        else {

          // if there is no user with that name
          // create the user
          var newUser = new User();

          // set the user's local credentials
          newUser.username = username;
          // If the username looks like an email, add that in
          if (emailValidate(username))
            newUser.email = username;
          // hash the password
          newUser.local.password = newUser.generateHash(password);

          // save the user
          newUser.save(function(err) {
            if (err) throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },

  function(req, username, password, done) { // callback with email and password from our form

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({
      'username': username
    }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err) return done(err);

      // if no user is found, return the message
      if (!user) return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

      // if the user is found but the password is wrong
      if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, user);
    });

  }));
  
  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy({
  
    // pull in our app id and secret from our auth.js file
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  
  // facebook will send back the token and profile
  function(req, token, refreshToken, profile, done) {
  
    // asynchronous
    process.nextTick(function() {
      
      // check if the user is already logged in
      if (!req.user) {
      
        // find the user in the database based on their facebook id
        User.findOne({
          'facebook.id': profile.id
        }, function(err, user) {
    
          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err) return done(err);
    
          // if the user is found, then log them in
          if (user) {
            // if there is a user id already but no token (user was linked at one point and then removed)
            // just add our token and profile information
            if (!user.facebook.token) {
              facebookUser(user, token, profile);
            
              user.save(function(err) {
                if (err) throw err;
                return done(null, user);
              });
            }
            
            return done(null, user); // user found, return that user
          }
          else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();
    
            // set all of the facebook information in our user model
            newUser.facebook.id = profile.id; // set the users facebook id
            
            // Generate a unique username, then save the user
            uniqueName(profile.emails[0].value, function (username) {
              facebookUser(newUser, token, profile, username);
    
              // save our user to the database
              newUser.save(function(err) {
                if (err) throw err;
      
                // if successful, return the new user
                return done(null, newUser);
              });
            });
          }
    
        });
      } else {
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session
        
        // update the current users facebook credentials
        user.facebook.id = profile.id;
        facebookUser(user, token, profile);
        
        // save the user
        user.save(function(err) {
          if (err) throw err;
          return done(null, user);
        });
      }
    });
  }));
  
  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  passport.use(new TwitterStrategy({
  
    // pull in our app id and secret from our auth.js file
    consumerKey     : configAuth.twitterAuth.consumerKey,
    consumerSecret  : configAuth.twitterAuth.consumerSecret,
    callbackURL     : configAuth.twitterAuth.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  
  function(req, token, refreshToken, profile, done) {
  
    // asynchronous
    process.nextTick(function() {
      
      // check if the user is already logged in
      if (!req.user) {
      
        // find the user in the database based on their facebook id
        User.findOne({
          'twitter.id': profile.id
        }, function(err, user) {
    
          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err) return done(err);
    
          // if the user is found, then log them in
          if (user) {
            
            // if there is a user id already but no token (user was linked at one point and then removed)
            // just add our token and profile information
            if (!user.twitter.token) {
              twitterUser(user, token, profile);
              user.save(function(err) {
                if (err) throw err;
                return done(null, user);
              });
            }
            
            return done(null, user); // user found, return that user
          }
          else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();
    
            // set all of the twitter information in our user model
            newUser.twitter.id          = profile.id;
            
            // Generate a unique username, then save the user
            uniqueName(profile.username, function (username) {
              twitterUser(newUser, token, profile, username);
    
              // save our user to the database
              newUser.save(function(err) {
                if (err) throw err;
      
                // if successful, return the new user
                return done(null, newUser);
              });
            });
          }
    
        });
      } else {
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session
        
        // update the current users twitter credentials
        user.twitter.id           = profile.id;
        twitterUser(user, token, profile);
        
        // save the user
        user.save(function(err) {
          if (err) throw err;
          return done(null, user);
        });
      }
    });
  }));
  
  // =========================================================================
  // GOOGLE ==================================================================
  // =========================================================================
  // Update a user w/ new info
  passport.use(new GoogleStrategy({
  
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback : true 
  },
  
  function(req, token, refreshToken, profile, done) {
  
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {
      
      // check if the user is already logged in
      if (!req.user) {
      
        // try to find the user based on their google id
        User.findOne({
          'google.id': profile.id
        }, function(err, user) {
          if (err) return done(err);
    
          if (user) {
            
            // if there is a user id already but no token (user was linked at one point and then removed)
            // just add our token and profile information
            if (!user.google.token) {
              googleUser(user, token, profile);
            
              user.save(function(err) {
                if (err) throw err;
                return done(null, user);
              });
            }
            
            // if a user is found, log them in
            return done(null, user);
          }
          else {
            // if the user isnt in our database, create a new user
            var newUser = new User();
    
            // set all of the relevant information
            newUser.google.id     = profile.id;
            
            // Generate a unique username, then save the user
            uniqueName(profile.emails[0].value, function (username) {
              googleUser(newUser, token, profile, username);
    
              // save our user to the database
              newUser.save(function(err) {
                if (err) throw err;
      
                // if successful, return the new user
                return done(null, newUser);
              });
            });
          }
        });
      } else {
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session
        
        // update the current users twitter credentials
        user.google.id     = profile.id;
        googleUser(user, token, profile);
        
        // save the user
        user.save(function(err) {
          if (err) throw err;
          return done(null, user);
        });
      }
    });
  }));

*/