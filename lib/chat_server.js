var UsersModel = require("./models/UsersModel"),
    usersModel;

//////////////////
// Controller
//////////////////
////////////
// User
////////////
/**
 * Handle a connection event
 */
function connectionHandler(socket, user) {
    return function () {
        var name = user;
        console.log(name + ' connection');
        
        // Add user to userlist
        usersModel.add(name, socket);
        // Broadcast new user
        socket.broadcast.emit('userIn', {
            name: name,
            available: true
        });
        // Send userlist to new user
        socket.emit('userlist', usersModel.socketUsers(name));
    };
}
/**
 * Handle a disconnect
 */
function disconnectHandler(socket, user) {
    return function () {
        var name = user;
        
        console.log('disconnect: ' + name);
        
        // Hang up any calls
        hangUpHandler(user)(usersModel.toName(name));
        
        // Broadcast that the user quit
        socket.broadcast.emit('userOut', name);
        // Remove the user from the model
        usersModel.remove(name);
    };
}
////////////
// Chooser
////////////
/**
 * Handle a call
 */
function callHandler(user) {
   return function (name) {
        // Send a ring event to the chosen user
        var userCaller = user,
            userCalled = name;
    
        console.log('call: ' + userCaller + ' to ' + userCalled);
    
        // Save the call as pending
        usersModel.setPending(userCaller, userCalled);
        // notify socket2 that socket1 wants to chat
        usersModel.emit(userCalled,'ring', userCaller);
   };
}
/**
 * Handle a canceled call
 */
function canceledCallHandler(user) {
   return function (name) {
        var userCalled = name,
            userCaller = user;
        
        // Verify that the call was initiated as pending as a security measure
        if (usersModel.checkPending(userCaller, userCalled)) {
            console.log(userCaller + ' canceled their call to ' + userCalled);
            
            // clear the pending entry
            usersModel.clearPending(userCaller);
            // notify the called used
            usersModel.emit(userCalled,'cancelRing', userCaller);
        }
    };
}
/**
 * Handle an "unavailable" response to a call
 */
function unavailableHandler(user) {
    return function (name) {
        // Send a ring event to the chosen user
        var userCalled = user,
            userCaller = name;
        
        // Verify that the call was initiated as pending as a security measure
        if (usersModel.checkPending(userCaller, userCalled)) {
            console.log(userCalled + ' is unavailable for ' + userCaller);
            
            // clear the pending entry
            usersModel.clearPending(userCaller);
            // notify the caller
            usersModel.emit(userCaller,'unavailable', userCalled);
        }
    };
}
/**
 * Handle a picked up response to a call
 */
function pickupHandler(user) {
    return function (name) {
        var userCalled = user,
            userCaller = name,
            output,
            i;
        
        // Verify that the call was initiated as pending as a security measure
        output = usersModel.startChat(userCaller, userCalled);
        
        for (i = 0; i < output.end.length; i++) {
            usersModel.emit(output.end[i][0],'hungup', output.end[i][1]);
        }
        for (i = 0; i < output.start.length; i++) {
            usersModel.emit(output.start[i][0],'startchat', output.start[i][1]);
        } 
    
        // Notify both users to start chatting
        usersModel.emit(userCalled,'startchat', userCaller);
        usersModel.emit(userCaller,'startchat', userCalled);
    };
}
/**
 * Hang up a users' call (if any)
 */
function hangUpHandler(user) {
    return function (name) {
        var nameHanger = user,
            nameOther = name;
        
        // try to end the chat
        if (usersModel.endChat(nameHanger, nameOther))
            usersModel.emit(nameOther,'hungup', nameHanger);
    };
}
////////////
// Chat
////////////
/**
 * Handle Input
 */
function inputHandler(user) {
    return function (input) {
        if (!usersModel.toEmit(user, 'input', input))
            hangUpHandler(user)(usersModel.toName(user));
    };
}
/**
 * Handle Back
 */
function backHandler(user) {
    return function () {
        if (!usersModel.toEmit(user, 'back'))
            hangUpHandler(user)(usersModel.toName(user));
    };
}
/**
 * Handle Clear
 */
function clearHandler(user) {
    return function () {
        if (!usersModel.toEmit(user, 'clear'))
            hangUpHandler(user)(usersModel.toName(user));
    };
}

/**
 * Callback for authorization success
 */
function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);
}
/**
 * Callback for authorization failure
 */
function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(null, false);
}

//////////////////
// Socket Server
//////////////////
exports.listen = function(server, sessionStore, cookieParser, passport, key, secret) {
    var io = require("socket.io")(server),
    passportSocketIo = require("passport.socketio"),
    user;
    
    // Set up the users model
    usersModel = new UsersModel();
    
    //With Socket.io >= 1.0
    io.use(passportSocketIo.authorize({
      cookieParser: cookieParser,
      key:         key,
      secret:      secret,
      store:       sessionStore,
      passport:    passport,
      success:     onAuthorizeSuccess,
      fail:        onAuthorizeFail,
    }));

    // Associate socket ID with username
    io.on('connection', function(socket) {
      try {user = socket.request.user.username;}
      catch (e) {}
      if (!user)
        socket.emit('err', 'Please log in before continuing');
      else {
        
        
        // Set up the connection
        connectionHandler(socket, user)();
  
        ////////////
        // Chooser
        ////////////
        // User calls another one
        socket
            // On disconnect
            .on('disconnect', disconnectHandler(socket, user))
            
            // Route a call
            .on('call', callHandler(user))
            // User cancelled a call
            .on('cancelRing', canceledCallHandler(user))
            // User is unavailable for call
            .on('unavailable', unavailableHandler(user))
            // User picks up call
            .on('pickup', pickupHandler(user))
            // User hangs up call
            .on('hangup', hangUpHandler(user))
  
        ////////////
        // Chat
        ////////////
            // Route a character
            .on('input', inputHandler(user))
            // Route a backspace
            .on('back', backHandler(user))
            // Route a clear
            .on('clear', clearHandler(user));
      }
    });
};