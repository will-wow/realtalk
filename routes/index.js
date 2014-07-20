// routes/index.js
// Routes for the app

var express = require('express'),
    userController = require('../lib/controllers/users'),
    router = express.Router(),
    isAuthenticated;

module.exports = function(app, passport) {
// =============================================================================
// NORMAL (NON-AUTH) ROUTES ====================================================
// =============================================================================
  // export the isAuthenticaed function
  isAuthenticated = passport.authenticate('basic', { session : false });
  
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index');
	});
  
// =============================================================================
// RESTful ROUTES ==============================================================
// =============================================================================
  // Send true if authenticated
  router.route('/signin')
    .get(isAuthenticated, function(req, res) {
      res.json({'success': true});
    });
  
  router.route('/new')
    .post(userController.postNew);
  
  router.route('/new/:username')
    .get(userController.getNew);
    
  router.route('/me')
    .get(isAuthenticated, userController.getMe)
    .post(isAuthenticated, userController.postMe)
    .delete(isAuthenticated, userController.deleteMe);
  
  router.route('/contacts')
    .delete(isAuthenticated, userController.deleteContacts)
    .post(isAuthenticated, userController.addContact);
    
  router.route('/contacts/:contacts?')
    .get(isAuthenticated, userController.getContacts)
    .delete(isAuthenticated, userController.deleteContact);
  
  router.route('/users/:users?')
    .get(isAuthenticated, userController.getUsers);
  
  app.use('/api',router);
};