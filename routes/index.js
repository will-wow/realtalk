// routes/index.js
// Routes for the app

var Link = require('./Link'),
    gravatar = require('gravatar');

module.exports = function(app, passport) {

// =============================================================================
// DATA FUNCTIONS ==============================================================
// =============================================================================
function navList (activeLink, isLoggedIn) {
  var links = [];
  
  if (isLoggedIn) {
    links.push(new Link(activeLink, 'Home', '/'));
    links.push(new Link(activeLink, 'Talk'));
    links.push(new Link(activeLink, 'Settings'));
    links.push(new Link(activeLink, 'Logout'));
  } else {
    links.push(new Link(activeLink, 'Home', '/'));
    links.push(new Link(activeLink, 'Login'));
  }
  
  return links;
}

function updateUserField(req, field) {
  var user = req.user,
      userVal = user[field],
      formVal = req.body[field];
  
  // If it does not match the existing value
  if (userVal !== formVal) {
    user[field] = formVal;
  }
}

// =============================================================================
// NORMAL (NON-AUTH) ROUTES ====================================================
// =============================================================================

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		console.log('HOME');
		res.render('index', {
      auth: !!req.user,
      title: ''}
		);
	});
  
  // =====================================
	// TALK ================================
	// =====================================
  app.get('/talk', isLoggedIn, function (req, res) {
    res.render('talk', {
      username: req.user.name,
      links: navList('talk', true),
      title: 'talk'
    });
  });
  
  // =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/settings', isLoggedIn, function(req, res) {
		res.render('settings.ejs', {
      message: req.flash('settingsMessage'),
			user : req.user, // get the user out of session and pass to template
			gravatar: gravatar.url(req.user.email || '', {
        d: 'retro',
        r: 'x'
			}, true),
			links: navList('settings', true),
			title: 'settings'
		});
	});
  
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
  
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
  
	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', {
      message: req.flash('loginMessage'),
      links: navList('login', !!req.user),
      title: 'login'
		}); 
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
      successRedirect : '/talk',
      failureRedirect : '/login',
      failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', {
      message: req.flash('signupMessage'),
      links: navList('signup', !!req.user),
      title: 'sign up'
    });
	});

	// process the signup form
	/*
	app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/settings', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
	}));
  */
	app.post('/signup', passport.authenticate('local-signup', {
      successRedirect : '/settings',
      failureRedirect : '/signup',
      failureFlash : true
	}));

  // =====================================
	// FACEBOOK AUTH =======================
	// =====================================
	// route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/settings',
			failureRedirect : '/'
		}));
  
  // =====================================
	// TWITTER AUTH =======================
	// =====================================
	// route for twitter authentication and login
	app.get('/auth/twitter', passport.authenticate('twitter'));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect : '/settings',
			failureRedirect : '/'
		}));
  
  // =====================================
  // GOOGLE AUTH =========================
  // =====================================
  // send to google to do the authentication
  // profile gets us their basic information including their name
  // email gets their emails
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/settings',
    failureRedirect: '/'
  }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

  // =====================================
	// LOCAL CONNECT =======================
	// =====================================
	app.get('/connect/local', function(req, res) {
		res.render('connect-local.ejs', {
      message: req.flash('loginMessage'),
      links: navList('local-connect', !!req.user),
      title: 'local connect'
    });
	});
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect : '/settings', // redirect to the secure profile section
		failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

  // =====================================
	// FACEBOOK CONNECT ====================
	// =====================================
	// send to facebook to do the authentication
	app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

	// handle the callback after facebook has authorized the user
	app.get('/connect/facebook/callback',
		passport.authorize('facebook', {
			successRedirect : '/settings',
			failureRedirect : '/'
		}));

  // =====================================
	// TWITTER CONNECT =====================
	// =====================================
	// send to twitter to do the authentication
	app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

	// handle the callback after twitter has authorized the user
	app.get('/connect/twitter/callback',
		passport.authorize('twitter', {
			successRedirect : '/settings',
			failureRedirect : '/'
		}));


  // =====================================
	// GOOGLE CONNECT =====================
	// =====================================
	// send to google to do the authentication
	app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

	// the callback after google has authorized the user
	app.get('/connect/google/callback',
		passport.authorize('google', {
			successRedirect : '/settings',
			failureRedirect : '/'
		}));

// =============================================================================
// UPDATE USER =================================================================
// =============================================================================
  app.post('/settings', isLoggedIn, function (req, res) {
    updateUserField(req, 'username');
    updateUserField(req, 'email');
    updateUserField(req, 'givenName');
    updateUserField(req, 'middleName');
    updateUserField(req, 'familyName');
    updateUserField(req, 'suffix');
    
    req.user.save(function(err) {
        res.redirect('/settings');
    });
  });

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user            = req.user;
    user.local.password = undefined;
    user.save(function(err) {
        if (err) {
          req.flash('settingsMessage', 'That username is already taken.');
        }
        res.redirect('/settings');
    });
  });

  // facebook -------------------------------
  app.get('/unlink/facebook', isLoggedIn, function(req, res) {
    var user            = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
        res.redirect('/settings');
    });
  });

  // twitter --------------------------------
  app.get('/unlink/twitter', isLoggedIn, function(req, res) {
    var user           = req.user;
    user.twitter.token = undefined;
    user.save(function(err) {
       res.redirect('/settings');
    });
  });

  // google ---------------------------------
  app.get('/unlink/google', function(req, res) {
    var user          = req.user;
    user.google.token = undefined;
    user.save(function(err) {
       res.redirect('/settings');
    });
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}