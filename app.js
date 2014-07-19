var express     = require('express'),
    http        = require('http'),
    path        = require('path'),
    session      = require('express-session'),
    sessionStore = new session.MemoryStore(),
    app         = express(),
    mongoose    = require('mongoose'),
    passport    = require('passport'),
    locals      = require('./config/get_locals'),
    configDB    = locals.URLS.MONGO,
    key         = locals.COOKIES.KEY,
    secret      = locals.COOKIES.SECRET,
    
    morgan       = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser');


// configuration ===============================================================
mongoose.connect(configDB); // connect to our database
mongoose.connection.once('open', function callback () {console.log('DB connect');});

require('./config/passport')(passport); // pass passport for configuration

// all environments
app.set('port', process.env.PORT || 8080);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser(secret));
app.use(session({
  store:  sessionStore,
  key:    key
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static(path.join(__dirname, 'app')));

// routes ======================================================================
// load routes and pass in app and fully configured passport
require('./routes')(app, passport); 

// Spin up http server =========================================================
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('WebTalk is listening on port ' + app.get('port'));
});
// Start up socket server ======================================================
var chatServer = require('./lib/chat_server');
chatServer.listen(server, sessionStore, cookieParser, passport, key, secret);
