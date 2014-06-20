var locals = require('./config/locals');

// expose our config directly to our application using module.exports
module.exports = {

  'facebookAuth': {
    'clientID'    : process.env.FACEBOOK_ID || locals.FACEBOOK_ID,
    'clientSecret': process.env.FACEBOOK_SECRET || locals.FACEBOOK_SECRET,
    'callbackURL' : 'http://localhost:8080/auth/facebook/callback'
  },

  'twitterAuth': {
    'consumerKey': process.env.TWITTER_ID || locals.TWITTER_ID,
    'consumerSecret': process.env.TWITTER_SECRET || locals.TWITTER_SECRET,
    'callbackURL': 'http://localhost:8080/auth/twitter/callback'
  },

  'googleAuth': {
    'clientID': process.env.GOOGLE_ID || locals.GOOGLE_ID,
    'clientSecret': process.env.GOOGLE_SECRET || locals.GOOGLE_SECRET,
    'callbackURL': 'http://localhost:8080/auth/google/callback'
  }

};