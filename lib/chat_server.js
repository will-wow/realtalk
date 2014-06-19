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
function connectionHandler(socket, session) {
    return function () {
        var name = session.user;
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
function disconnectHandler(socket, session) {
    return function () {
        var name = session.user;
        
        console.log('disconnect: ' + name);
        
        // Hang up any calls
        hangUpHandler(session)(usersModel.toName(name));
        
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
function callHandler(session) {
   return function (name) {
        // Send a ring event to the chosen user
        var userCaller = session.user,
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
function canceledCallHandler(session) {
   return function (name) {
        var userCalled = name,
            userCaller = session.user;
        
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
function unavailableHandler(session) {
    return function (name) {
        // Send a ring event to the chosen user
        var userCalled = session.user,
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
function pickupHandler(session) {
    return function (name) {
        var userCalled = session.user,
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
function hangUpHandler(session) {
    return function (name) {
        var nameHanger = session.user,
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
function inputHandler(session) {
    return function (input) {
        if (!usersModel.toEmit(session.user, 'input', input))
            hangUpHandler(session)(usersModel.toName(session.user));
    };
}
/**
 * Handle Back
 */
function backHandler(session) {
    return function () {
        if (!usersModel.toEmit(session.user, 'back'))
            hangUpHandler(session)(usersModel.toName(session.user));
    };
}
/**
 * Handle Clear
 */
function clearHandler(session) {
    return function () {
        if (!usersModel.toEmit(session.user, 'clear'))
            hangUpHandler(session)(usersModel.toName(session.user));
    };
}

//////////////////
// Socket Server
//////////////////
exports.listen = function(server, sessionStore, cookieParser) {
    var socketio = require('socket.io'),
    SessionSockets = require('session.socket.io'),
    sessionSockets,
    io;
    
    // Set up the users model
    usersModel = new UsersModel();
    
    // start Socket.IO server with HTTP server's port etc.
    io = socketio.listen(server);
    // Set up sessionSockets
    sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

    // Associate socket ID with username
    sessionSockets.on('connection', function(err, socket, session) {
        
        // don't continue on authentication error
        if (err) socket.emit('err', 'Connection error');
        else if (!(session.user)) socket.emit('err', 'Please log in first');
        else {
            // Set up the connection
            connectionHandler(socket, session)();

            ////////////
            // Chooser
            ////////////
            // User calls another one
            socket
                // On disconnect
                .on('disconnect', disconnectHandler(socket, session))
                
                // Route a call
                .on('call', callHandler(session))
                // User cancelled a call
                .on('cancelRing', canceledCallHandler(session))
                // User is unavailable for call
                .on('unavailable', unavailableHandler(session))
                // User picks up call
                .on('pickup', pickupHandler(session))
                // User hangs up call
                .on('hangup', hangUpHandler(session))

            ////////////
            // Chat
            ////////////
                // Route a character
                .on('input', inputHandler(session))
                // Route a backspace
                .on('back', backHandler(session))
                // Route a clear
                .on('clear', clearHandler(session));
        }
    });
};