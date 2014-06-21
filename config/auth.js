// Get locals file, if it exists
try {var locals = require('./config/locals');}
catch(e) {locals=null;}

// expose our config directly to our application using module.exports
module.exports = {

  'facebookAuth': {
    'clientID'    : process.env.FACEBOOK_ID || locals.FACEBOOK_ID,
    'clientSecret': process.env.FACEBOOK_SECRET || locals.FACEBOOK_SECRET,
    'callbackURL' : (process.env.URL || locals.URL) + '/auth/facebook/callback'
  },

  'twitterAuth': {
    'consumerKey'   : process.env.TWITTER_ID || locals.TWITTER_ID,
    'consumerSecret': process.env.TWITTER_SECRET || locals.TWITTER_SECRET,
    'callbackURL'   : (process.env.URL || locals.URL) + '/auth/facebook/callback'
  },

  'googleAuth': {
    'clientID'    : process.env.GOOGLE_ID || locals.GOOGLE_ID,
    'clientSecret': process.env.GOOGLE_SECRET || locals.GOOGLE_SECRET,
    'callbackURL' : (process.env.URL || locals.URL) + '/auth/facebook/callback'
  }

};