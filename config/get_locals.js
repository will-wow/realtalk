// Get local variables from either a locals.js file, or the environment

var variables, locals;

// Get locals file, if it exists
// (Cloud9 IDE doesn't support environment variables)
try {
  locals = require('./locals');
}
catch(e) {
  locals=null;
}

// If locals found
if (locals) {
  // Save the locals into the variables object
  variables = locals;
// If no locals file
} else {
  // Try pulling from the environment instead
  // This works well for the production server
  variables = {
    COOKIES: {
      SECRET: process.env.SECRET,
      KEY: process.env.KEY
    },
    URLS: {
      MONGO: process.env.MONGO_URL,
      AUTH: process.env.AUTH_URL
    }
  };
}

// Export the variables
module.exports = variables;