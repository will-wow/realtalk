var express     = require('express'),
    connect     = require('connect'),
    http        = require('http'),
    path        = require('path'),
    login       = require('./routes/login'),
    about       = require('./routes/about'),
    chat        = require('./routes/chat'),
    settings    = require('./routes/settings'),
    logout      = require('./routes/logout'),
    cookieParser = express.cookieParser('your secret sauce'),
    sessionStore = new connect.middleware.session.MemoryStore(),
    auth        = require('./lib/auth'),
    app         = express(),
    mongoose    = require('mongoose'),
    passport    = require('passport'),
    flash       = require('connect-flash'),
    configDB    = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {
    
    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    //app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(cookieParser);
    app.use(express.session({
        store: sessionStore
    }));
    app.use(passport.initialize());
        app.use(passport.session()); // persistent login sessions
        app.use(flash()); // use connect-flash for flash messages stored in session
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);
    
    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }
});

// routes ======================================================================
require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

/*
app.get('/', login.form);
app.post('/', login.submit);
app.get('/about', about.page);
app.get('/chat', auth.mw, chat.app);
app.get('/settings', auth.mw, settings.form);
app.get('/logout', logout.redirect);
*/

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server, sessionStore, cookieParser);