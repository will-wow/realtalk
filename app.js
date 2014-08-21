var express     = require('express'),
    http        = require('http'),
    session     = require('express-session'),
    mongoose    = require('mongoose'),
    passport    = require('passport'),
    locals      = require('./config/get_locals'),
    morgan      = require('morgan'),
    cookieParser= require('cookie-parser'),
    bodyParser  = require('body-parser'),
    
    sessionStore= new session.MemoryStore(),
    app         = express(),
    configDB    = locals.URLS.MONGO,
    key         = locals.COOKIES.KEY,
    secret      = locals.COOKIES.SECRET;
    
// configuration ===============================================================
mongoose.connect(configDB); // connect to our database
mongoose.connection.once('open', function callback () {
  console.log('DB connect');
});

require('./config/passport')(passport); // pass passport for configuration

// all environments
app.set('port', process.env.PORT || 8080);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser(secret));
app.use(session({
  store:  sessionStore,
  key:    key
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
 });

// routes ======================================================================
// load routes and pass in app and fully configured passport
require('./routes')(app, passport); 

// Start up http server =========================================================
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('realtalk. is listening on port ' + app.get('port'));
});
// Start up socket server ======================================================
var chatServer = require('./lib/chat_server');
chatServer.listen(server, sessionStore, cookieParser, passport, key, secret);
