// TODO: Switch to users being users[username] = socket;
// Then users[username].emit(foo)

var socketio = require('socket.io'),
    SessionSockets = require('session.socket.io'),
    sessionSockets,
    io,
    session,
    socket,
    usersModel = new UsersModel();

/**
 * UserModel
 */
function User(socket) {
    this.socket = socket,
    this.toUser = null;
    this.pendingToUser = null;
}
User.prototype = {
    /**
     * Check if a User exists in the User DB
     */
    verifyUser: function (name) {
        //TODO
    }
};

/**
 * UsersModel
 */
function UsersModel() {
    this._users = {};
}
/**
 * Add a user
 * @param: name - The username
 * @param: socket - The user's socket
 */
UsersModel.prototype.add = function (name, socket) {
    this._users[name] = new User(socket);
};
/**
 * Remove a user
 * @param: name - The username
 * @param: socket - The user's socket
     */
UsersModel.prototype.remove = function (name) {
    delete this._users[name];
};
/**
 * Set two users' socketTo attributes to each other's sockets
 * @param: socket1 - the first user's socket
 * @param: socket2 - the second user's socket
 */
UsersModel.prototype.startChat = function (name1, name2) {
    console.log('startChat: ' + name1 + ' is chatting with ' + name2);
    this._users[name1].socketTo = this._users[name2];
    this._users[name2].socketTo = this._users[name1];
};
/**
 * Remove two users' toUser attributes to end a chat
 * @param: nameHanger - the first user's name
 * @param: nameOther - the second user's name
 */
UsersModel.prototype.endChat = function (nameHanger, nameOther) {
    console.log('endChat: ' + nameHanger + ' hung up on ' + nameOther);
    // Reset the toUser attributes
    this._users[nameHanger].toUser = null;
    this._users[nameOther].toUser = null;

    // Notify the user who was hung up on
    this._users[nameOther].emit('hungup', this._users[nameHanger].name);
};
/**
 * Look up a socket by username
 * @param: name - The username
 * @return: The user's socket
 */
UsersModel.prototype.socket = function (name) {
    return this._users[name].socket;
};
/**
 * Look by username the socket a user is talking to
 * @param: name - The username
 * @return: The user's socket
 */
UsersModel.prototype.toSocket = function (name) {
    if (this._users[name].userTo)
        return this._users[name].toUser.socket;
    else
        return null;
};
UsersModel.prototype.toName = function (name) {
    if (this._users[name].userTo)
        return this._users[name].toUser.name;
    else
        return null;
};
/**
 * Return an array of users with an open socket
 * @param: {String} skipName - A username to skip
 * @return: an array of JSON objects
 */
UsersModel.prototype.socketUsers = function (skipName) {
    var usersAvailable = [],
        users = this._users,
        name,
        user;
    
    for (name in users) {
        if (users.hasOwnProperty(name)) {
            // Get reference to the user instance
            user = users[name];
            // If it's not the one to skip:
            if (user.name !== skipName) {
                // Set up the JSON for the user
                // If user.toUser === true, user is busy
                usersAvailable.push({
                    name: user.name,
                    available: (!user.toUser)
                });
            }
        }
    }
    // Return the finished list
    return usersAvailable;
};
//////////////////
// Pending methods
//////////////////
/**
 * Set two users as pending a call
 * @param: {String} nameCaller - The username of the user starting the call
 * @param: {String} nameCalled - The user being called
 */
UsersModel.prototype.setPending = function (nameCaller, nameCalled) {
    var users = this._users;
    
    // Set the caller's pending attribute as the called's user instance
    users[nameCaller].pendingToUser = users[nameCalled];
};
/**
 * Clear a user's pending field
 * @param: {String} nameCaller - The first username to check
 * @param: {String} nameCalled - The second username to check
 */
UsersModel.prototype.clearPending = function (nameCaller) {
    this._users[nameCaller].pendingToUser = null;
};
/**
 * Check if two users are marked as pending
 * @param: {String} nameCaller - The username of the user starting the call
 * @param: {String} nameCalled - The user being called
 * @return: {boolean} True if the caller has the called in their pending
 */
UsersModel.prototype.checkPending = function (nameCaller, nameCalled) {
    var users = this._users;
    
    // Return true if the caller shows as having a pending call to the called
    return (users[nameCaller].pendingToUser === users[nameCalled]);
};

//////////////////
// Controller
//////////////////
////////////
// User
////////////
/**
 * Handle a connection event
 */
function connectionHandler() {
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
}
////////////
// Chooser
////////////
/**
 * Handle a call
 */
function callHandler(name) {
    // Send a ring event to the chosen user
    var userCaller = session.name,
        userCalled = name;

    console.log('call: ' + userCaller + ' to ' + userCalled);

    // Save the call as pending
    usersModel.setPending(userCaller, userCalled);
    // notify socket2 that socket1 wants to chat
    usersModel.socket[userCalled].emit('ring', userCaller);
}
/**
 * Handle an "unavailable" response to a call
 */
function unavailableHandler(name) {
    // Send a ring event to the chosen user
    var userCalled = session.name,
        userCaller = name;
    
    console.log(userCalled + ' is unavailable for ' + userCaller);
    
    // Verify that the call was initiated as pending as a security measure
    if (usersModel.checkPending(userCalled, userCaller)) {
        // clear the pending entry
        usersModel.clearPending(userCaller);
        // notify the caller
        usersModel.socket(userCaller).emit('unavailable', userCalled);
    }
}
/**
 * Handle a picked up response to a call
 */
function pickupHandler(name) {
    var userCalled = session.name,
        userCaller = name;
    
    console.log(userCalled + ' picked up ' + userCaller);
    
    // Verify that the call was initiated as pending as a security measure
    if (usersModel.checkPending(userCalled, userCaller)) {
        // Allow the users to chat to eachother
        usersModel.clearPending(userCaller);
        usersModel.startChat(userCalled, userCaller);
        
        // Notify both users to start chatting
        usersModel.socket(userCalled).emit('startchat', userCaller);
        usersModel.socket(userCaller).emit('startchat', userCalled);
    }
}
/**
 * Hang up a users' call (if any)
 */
function hangUpHandler() {
    var nameHanger = session.user,
        nameOther = usersModel.toName(nameHanger);
    
    if (nameOther) {
        console.log(nameHanger + ' hung up on ' + nameOther);
        usersModel.endChat(nameHanger, nameOther);
    }
}
/**
 * Handle a disconnect
 */
function disconnectHandler() {
    var name = session.user;
    
    console.log('disconnect: ' + name);
    
    // Hang up any calls
    hangUpHandler();
    
    // Broadcast that the user quit
    socket.broadcast.emit('userOut', name);
    // Remove the user from the model
    usersModel.remove(name);
}
////////////
// Chat
////////////
/**
 * Handle Input
 */
function inputHandler(input) {
    usersModel.toSocket(session.user).emit('input', input);
}
/**
 * Handle Back
 */
function backHandler() {
    usersModel.toSocket(session.user).emit('back');
}
/**
 * Handle Clear
 */
function clearHandler() {
    usersModel.toSocket(session.user).emit('clear');
}

//////////////////
// Socket Server
//////////////////
exports.listen = function(server, sessionStore, cookieParser) {
    // start Socket.IO server with HTTP server's port etc.
    io = socketio.listen(server);
    // Set up sessionSockets
    sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

    // Associate socket ID with username
    sessionSockets.on('connection', function(err, sock, sess) {
        session = sess;
        socket = sock;
        
        // don't continue on authentication error
        if (err) socket.emit('err', 'Connection error');
        else if (!(session.user)) socket.emit('err', 'Please log in first');
        else {
            // Set up the connection
            connectionHandler();

            ////////////
            // Chooser
            ////////////
            // User calls another one
            socket
                // On disconnect
                .on('disconnect', disconnectHandler)
                
                // Route a call
                .on('call', callHandler)
                // User is unavailable for call
                .on('unavailable', unavailableHandler)
                // User picks up call
                .on('pickup', pickupHandler)
                // User hangs up call
                .on('hangup', hangUpHandler)

            ////////////
            // Chat
            ////////////
                // Route a character
                .on('input', inputHandler)
                // Route a backspace
                .on('back', backHandler)
                // Route a clear
                .on('clear', clearHandler);
        }
    });
};