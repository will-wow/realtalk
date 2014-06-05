var express = require('express');
var res = express.response;

/**
 * Save a message in the session to be sent to the user
 * @param msg - The message text
 * @param type - The message type (error, etc.)
 */
res.message = function(msg, type) {
  // set type if not specified
  type = type || 'info';
  // Reference session
  var sess = this.req.session;
  // Create message array, if not there
  sess.messages = sess.messages || [];
  // Add new message
  sess.messages.push({
    type: type,
    string: msg
  });
};

/**
 * Send an error message
 * @param msg - The message text
 */
res.error = function(msg){
  return this.message(msg, 'error');
};

/**
 * Middleware to put session messages into locals
 */
module.exports = function(req, res, next) {
  // Create the local message variable from the session messages
  res.locals.messages = req.session.messages || [];
  // Allows the dev to clear the session messages
  res.locals.removeMessages = function() {
    req.session.messages = [];
  };
  next();
};