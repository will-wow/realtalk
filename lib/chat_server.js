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
        socket.broadcast.emit('userIn', name);
    };
}
/**
 * Handle a disconnect
 */
function disconnectHandler(socket, user) {
    return function () {
        var userPendingFrom = usersModel.getPendingFrom(user),
            userPendingTo = usersModel.getPendingTo(user);
        
        console.log('disconnect: ' + user);
        
        // Cancel any rings to the user
        if (userPendingFrom) {
            unavailableHandler(userPendingFrom)(user);
        }
        
        // Cancel any rings from the user
        if (userPendingTo) {
            canceledCallHandler(user)(userPendingTo);
        }
        
        // Hang up any calls
        hangUpHandler(user)(usersModel.toName(user));
        
        // Broadcast that the user quit
        socket.broadcast.emit('userOut', user);
        // Remove the user from the model
        usersModel.remove(user);
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
        
        // Emit end events for each ending party
        for (i = 0; i < output.end.length; i++) {
            usersModel.emit(output.end[i][0],'hungup', output.end[i][1]);
        }
        // Emit start events for each starting party
        for (i = 0; i < output.start.length; i++) {
            usersModel.emit(output.start[i][0],'startchat', output.start[i][1]);
        } 
    };
}
/**
 * Hang up a users' call (if any)
 */
function hangUpHandler(user) {
    return function () {
        var nameHanger = user,
            nameOther = usersModel.toName(user);
        
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

//////////////////
// Socket Server
//////////////////
exports.listen = function(server, sessionStore, cookieParser, passport, key, secret) {
    var io = require("socket.io")(server),
    user;
    
    // Set up the users model
    usersModel = new UsersModel();
    
    // Authenticate user with Passport BASIC
    io.use(function (socket, next) {
        var req = {};
        
        req.headers = {};
        req.headers.authorization = socket.request._query.Authorization;
        
        passport.authenticate('basic', { session : false }, 
            // callback
            function (err, puser, info) {
                if (err || !puser) {
                    console.log('Not authorized');
                    return next(new Error('Not authorized'));
                } else {
                    // Remove any other logged in instances of the user
                    usersModel.keepUserUnique(puser.username);
                    // Set the user variable
                    user = puser.username;
                    console.log(user + ': Authorized!');
                    return next();
                }
        })(req);
    });

    // Associate socket ID with username
    io.on('connection', function(socket) {
        
        // Set up the connection
        connectionHandler(socket, user)();
  
        ////////////
        // Chooser
        ////////////
        // User calls another one
        socket
            // On userlist request
            .on('userlist', function () {
                // Send userlist to new user
                console.log(usersModel.socketUsers(user));
                socket.emit('userlist', usersModel.socketUsers(user));
            })
            
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
      
    });
};