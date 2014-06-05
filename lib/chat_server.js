var socketio = require('socket.io'),
    SessionSockets = require('session.socket.io'),
    sessionSockets,
    io,
    room = 'chat',
    users = require('./users'),
    userlist = {};

function lookupUsername(name) {
  for (var socket in userlist) {
    if(userlist.hasOwnProperty(socket)){
      if (userlist[socket] === name)
        // return the associated socket
        return socket;
    }
  }
  // Return false if nothing found
  return false;
}

// start up socket server
exports.listen = function(server, sessionStore, cookieParser) {
  // start Socket.IO server with HTTP server's port etc.
  io = socketio.listen(server);
  // limit the console logging
  io.set('log level', 1);
  // Set up sessionSockets
  sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
  
  // Associate socket ID with username
  sessionSockets.on('connection', function (err, socket, session) {
    userlist[socket.id] = session.user;
    
    socket.on('disconnect', function() {
      delete userlist[socket.id];
    });
  });
  
  // Chat
  io.of('/chat').on('connection', function (socket) {
    // place user in the lobby room
    socket.join(room);
    
    // Route a character
    socket.on('char', function (char) {
      socket.broadcast.to(room).emit('char', {'next': char.next});
    });
    // Route a backspace
    socket.on('back', function () {
      socket.broadcast.to(room).emit('back');
    });
  });
  
  // Send a user list
  io.of('/chooser').on('connection', function (socket) {
    socket.emit('userlist',JSON.stringify(users.userList(userlist[socket.id])));
    
    // User calls another one
    socket.on('call', function (name) {
      // Send a ring event to the chosen user
      socket.broadcast.to(lookupUsername(name)).emit('ring',userlist[socket.id]);
    });
    // User is unavailable for call
    socket.on('unavailable', function (response) {
      // Send a ring event to the chosen user
      socket.broadcast.to(lookupUsername(response.name)).emit('unavailable',userlist[socket.id]);
    });
    // User picks up call
    socket.on('pickup', function () {
      //TODO
    });
    // User hangs up call
    socket.on('hangup', function (name) {
      //TODO
    });
  });
};
