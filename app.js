var express     = require('express'),
    connect     = require('connect'),
    http        = require('http'),
    path        = require('path'),
    try{
    locals      = require('./config/locals'),
    }
    except(e) {//y 
    locals=null;}
    key         = process.env.KEY || locals.KEY,
    secret      = process.env.SECRET || locals.SECRET,
    cookieParser = express.cookieParser,
    sessionStore = new connect.middleware.session.MemoryStore(),
    app         = express(),
    mongoose    = require('mongoose'),
    passport    = require('passport'),
    flash       = require('connect-flash'),
    configDB    = process.env.MONGO_URL || locals.MONGO_URL;


// configuration ===============================================================
mongoose.connect(configDB); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(cookieParser(secret));
app.use(express.session({
  store:  sessionStore,
  key:    key
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

// routes ======================================================================
// load routes and pass in app and fully configured passport
require('./routes.js')(app, passport); 

// Spin up http server =========================================================
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
// Start up socket server ======================================================
var chatServer = require('./lib/chat_server');
chatServer.listen(server, sessionStore, cookieParser, passport, key, secret);
