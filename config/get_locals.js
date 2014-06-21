//config/get_locals.js

// Get local variables from either a locals.js file, or the enviornment

var variables, locals;

// Get locals file, if it exists
try {locals = require('./locals');}
catch(e) {locals=null;}

if (locals) {
  variables = locals;
} else {
  variables = {
    COOKIES: {
      SECRET: process.env.SECRET,
      KEY: process.env.KEY
    },
    URLS: {
      MONGO: process.env.MONGO_URL,
      CALLBACK: process.env.AUTH_URL
    },
    FACEBOOK: {
      ID: process.env.FACEBOOK_ID,
      SECRET: process.env.FACEBOOK_SECRET
    },
    GOOGLE: {
      ID: process.env.GOOGLE_ID,
      SECRET: process.env.GOOGLE_SECRET
    },
    TWITTER: {
      ID: process.env.TWITTER_ID,
      SECRET: process.env.TWITTER_SECRET
    }
  };
}

// Export the variables
module.exports = variables;