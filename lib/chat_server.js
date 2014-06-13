//TODO: Switch to users being users[username] = socket;
// Then users[username].emit(foo)

var socketio = require('socket.io'),
    SessionSockets = require('session.socket.io'),
    sessionSockets,
    io,
    userlist = {},
    pending = {};

var Chatter = function (user, socket) {
  this.user = user,
  this.socket = socket,
  this.socketIdTo = null;
};

/**
 * Look up a socket by username
 * @param: name - The username
 * @return: The user's socket
 */
function lookupUsername(name) {
  for (var socketID in userlist) {
    if(userlist.hasOwnProperty(socketID)){
      if (userlist[socketID].user === name)
        // return the associated socket
        return userlist[socketID].socket;
    }
  }
  // Return false if nothing found
  return false;
}

/**
 * Return an array of available users
 * @param: user - The username
 * @return: an array of available users
 */
function availableUsers(user) {
  var usersAvailable = {};
  
  for (var userid in userlist) {
    if(userlist.hasOwnProperty(userid)){
      var chatter = userlist[userid];
      if (chatter.user !== user) {
        if (chatter.socketTo)
          usersAvailable[chatter.user] = true;
        else
          usersAvailable[chatter.user] = false;
      }
    }
  }
  
  return usersAvailable;
}

function verifyPending(socketid1, socketid2) {
  var socket1Pending = pending[socketid1],
      socket2Pending = pending[socketid2];
  
  // Verify that the call was initiated as pending as a security measure
  return (!(socketid1 === socket2Pending && socketid2 === socket1Pending));
}

/**
 * Set two users' socketTo attributes to each other's sockets
 * @param: socket1 - the first user's socket
 * @param: socket2 - the second user's socket
 */
function startChat(socket1, socket2) {
  console.log('startChat');
  userlist[socket1.id].socketTo = socket2;
  userlist[socket2.id].socketTo = socket1;
  
  //TODO: note user as busy
}

function endChat(socketHanger, socketOther) {
  console.log('endChat');
  userlist[socketHanger.id].socketTo = null;
  userlist[socketOther.id].socketTo = null;
  
  // Notify the user who was hung up on
  socketOther.emit('hungup',userlist[socketHanger.id].user);
  //TODO: Note user as available
}

/**
 * Hang up a users' call (if any)
 */
function hangUpHandler() {
  console.log('hangup');
  
  var socketHanger = this,
    socketOther = userlist[socketHanger.id].socketTo;
  
  if (socketOther) {
    endChat(socketHanger, socketOther);
  }
}

// start up socket server
exports.listen = function(server, sessionStore, cookieParser) {
  // start Socket.IO server with HTTP server's port etc.
  io = socketio.listen(server);
  // Set up sessionSockets
  sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
  
  // Associate socket ID with username
  sessionSockets.on('connection', function (err, socket, session) {
    // don't continue on authentication error
    if (err)
      socket.emit('err','Connection error');
    else if (!(session.user))
      socket.emit('err','Please log in first');
    else {
      console.log(session.user + ' connection');
      
      // Add user to userlist
      userlist[socket.id] = new Chatter(session.user, socket);
      // Broadcast new user
      socket.broadcast.emit('userIn',userlist[socket.id].user);
      // Send userlist to new user
      socket.emit('userlist',JSON.stringify(availableUsers(session.user)));
      
      
      ////////////
      // Chooser
      ////////////
      // User calls another one
      socket.on('call', function (name) {
        
        // Send a ring event to the chosen user
        var socketCalled = lookupUsername(name);
        var socketCaller = socket;
        
        console.log('call: ' + socketCaller.id + ' to ' + socketCalled.id);
        
        // Save the call as pending
        pending[socketCalled.id] = socketCaller.id;
        // notify socket2 that socket1 wants to chat
        socketCalled.emit('ring',userlist[socketCaller.id].user);
      });
      // User is unavailable for call
      socket.on('unavailable', function (response) {
        console.log('unavailable');
        // Send a ring event to the chosen user
        var socketCalled = socket;
        var socketCaller = lookupUsername(name);
        
        if (verifyPending(socketCalled.id, socketCaller.id)) {
          // clear the pending entry
          delete pending[socketCalled.id];
          // notify the caller
          socketCaller.emit('unavailable',userlist[socketCalled.id].user);
        }
      });
      // User picks up call
      socket.on('pickup', function (name) {
        console.log('pickup');
        var socketCalled = socket,
          socketCaller = lookupUsername(name);
        
        // Verify that the call was initiated as pending as a security measure
        if (verifyPending(socketCalled.id, socketCaller.id)) {
          // Allow the users to chat to eachother
          startChat(socketCalled, socketCaller);
          delete pending[socketCalled.id];
        }
        
        // Notify both users to start chatting
        socketCalled.emit('startchat',userlist[socketCaller.id].user);
        socketCaller.emit('startchat',userlist[socketCalled.id].user);
      });
      // User hangs up call
      socket.on('hangup',hangUpHandler);
      socket.on('disconnect',hangUpHandler);
      
      // Disconnect
      socket.on('disconnect', function() {
        console.log('disconnect');
        socket.broadcast.emit('userOut',session.user);
        delete userlist[socket.id];
      });
      
      ////////////
      // Chat
      ////////////
      // Route a character
      socket.on('char', function (char) {
        userlist[socket.id].socketTo.emit('char', char);
      });
      socket.on('input', function (input) {
        userlist[socket.id].socketTo.emit('input', input);
      });
      // Route a backspace
      socket.on('back', function () {
        userlist[socket.id].socketTo.emit('back');
      });
      // Route a clear
      socket.on('clear', function () {
        userlist[socket.id].socketTo.emit('clear');
      });
    }
  });
};