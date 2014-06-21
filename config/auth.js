// Get locals file, if it exists
var locals = require('./get_locals');

// expose our config directly to our application using module.exports
module.exports = {

  'facebookAuth': {
    'clientID'    : locals.FACEBOOK.ID,
    'clientSecret': locals.FACEBOOK.SECRET,
    'callbackURL' : locals.URLS.AUTH + '/auth/facebook/callback'
  },

  'twitterAuth': {
    'consumerKey'   : locals.TWITTER.ID,
    'consumerSecret': locals.TWITTER.SECRET,
    'callbackURL'   : locals.URLS.AUTH + '/auth/twitter/callback'
  },

  'googleAuth': {
    'clientID'    : locals.GOOGLE.ID,
    'clientSecret': locals.GOOGLE.SECRET,
    'callbackURL' : locals.URLS.AUTH + '/auth/google/callback'
  }

};