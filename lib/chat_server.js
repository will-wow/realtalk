var socketio = require('socket.io'),
    SessionSockets = require('session.socket.io'),
    sessionSockets,
    io,
    room = 'chat',
    users = require('./users'),
    userlist = {},
    pending = {};

var Chatter = function (user) {
  this.user = user,
  this.socketTo =  null;
};

function lookupUsername(name) {
  for (var socket in userlist) {
    if(userlist.hasOwnProperty(socket)){
      if (userlist[socket].user === name)
        // return the associated socket
        return socket;
    }
  }
  // Return false if nothing found
  return false;
}

function startChat(socket1, socket2) {
  userlist[socket1].socketTo = socket2;
  userlist[socket1].socketTo = socket1;
  
  //TODO: note user as busy
}

function endChat(socket1, socket2) {
  userlist[socket1].socketTo = null;
  userlist[socket1].socketTo = null;
  
  //TODO: Note user as available
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
    // don't continue on authentication error
    //if (err) next(err);
    
    // Add user to userlist
    userlist[socket.id] = new Chatter(session.user);
    // Broadcast new user
    socket.broadcast.to('/').emit('userIn',userlist[socket.id].user);
    
    // Disconnect
    socket.on('disconnect', function() {
      socket.broadcast.to('/').emit('userOut',userlist[socket.id].user);
      delete userlist[socket.id];
    });
    
    
    ////////////
    // Chooser
    ////////////
    socket.emit('userlist',JSON.stringify(users.userList(userlist[socket.id].user)));
    // User calls another one
    socket.on('call', function (name) {
      // Send a ring event to the chosen user
      var socketCalled = lookupUsername(name);
      var socketCaller = socket.id;
      
      // Save the call as pending
      pending[socketCalled] = socketCaller;
      // notify socket2 that socket1 wants to chat
      socket.broadcast.to(socketCalled).emit('ring',userlist[socketCaller].user);
    });
    // User is unavailable for call
    socket.on('unavailable', function (response) {
      // Send a ring event to the chosen user
      var socketCalled = socket.id;
      var socketCaller = lookupUsername(response.name);
      
      // clear the pending entry
      delete pending[socketCalled];
      // notify the caller
      socket.broadcast.to(socketCaller).emit('unavailable',userlist[socketCalled].user);
    });
    // User picks up call
    socket.on('pickup', function (name) {
      var socketCalled = socket.id;
      var socketCaller = lookupUsername(name);
      
      // Verify that the call was initiated as pending as a security measure
      if (pending[socketCalled] === socketCaller) {
        // Allow the users to chat to eachother
        startChat(socketCalled,socketCaller);
        delete pending[socketCalled];
      }
      
      // Notify both users to start chatting
      socket.broadcast.to(socketCalled).emit('startchat',userlist[socketCaller].user);
      socket.broadcast.to(socketCaller).emit('startchat',userlist[socketCalled].user);
    });
    // User hangs up call
    socket.on('hangup', function (name) {
      var socketHanger = socket.id;
      var socketOther = lookupUsername(name);
      
      // Check that users are currently chatting
      if (userlist[socketHanger].socketTo === socketOther) {
        // End the chat
        endChat(socketHanger,socketOther);
      }
      
      // Notify the user who was hung up on
      socket.broadcast.to(socketOther).emit('endchat',userlist[socketHanger].user);
    });
    
    ////////////
    // Chat
    ////////////
    // Route a character
    socket.on('char', function (char) {
      socket.broadcast.to(userlist[socket].socketTo).emit('char', {'next': char.next});
    });
    // Route a backspace
    socket.on('back', function () {
      socket.broadcast.to(userlist[socket.id].socketTo).emit('back');
    });
  });
};