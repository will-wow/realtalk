/**
 * UserModel
 */
function User(name, socket) {
    this.name = name,
    this.socket = socket,
    this.toUser = null;
    this.pendingToUser = null;
}

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
    this._users[name] = new User(name, socket);
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
 * Check if two users are chatting
 * @param: name1 - the first user's name
 * @param: name2 - the second user's name
 */
UsersModel.prototype.areChatting = function (name1, name2) {
    // get user references
    var chatting;
    
    try{
        chatting = (this.toName(name1) === name2 && this.toName(name2) === name1);
    }
    catch (TypeError) {
        chatting = false;
    }
    
    return chatting;
};
/**
 * Set two users' toUser attributes to each other
 * @param: socket1 - the first user's socket
 * @param: socket2 - the second user's socket
 */
UsersModel.prototype.startChat = function (name1, name2) {
    // get user references
    var user1 = this._users[name1],
        user2 = this._users[name2],
        end1,
        end2,
        output = {
            start: [],
            end: []
        };
    
    // Check if users exist and are not already chatting
    if (user1 && user2 && !this.areChatting(name1, name2)) {
        // Make sure the call was pending
        if (this.checkPending(name1, name2)) {
            console.log('startChat: ' + name2 + ' picked up ' + name1);
            
            this.clearPending(name1);
            
            // End old chats, if any
            end1 = this.endChat(name1, this.toName(name1));
            end2 = this.endChat(name2, this.toName(name2));
            
            // Return the chats ending (for notification)
            if (end1)
                output.end.push(end1);
            if (end2)
                output.end.push(end2);
            
            // Set up new chat
            user1.toUser = user2;
            user2.toUser = user1;
            
            // Return the chats starting (for notification)
            output.start.push([name1, name2]);
            output.start.push([name2, name1]);
        }
    }
    
    // Return the output
    return output;
};
/**
 * Remove two users' toUser attributes to end a chat
 * @param: nameHanger - the first user's name
 * @param: nameOther - the second user's name
 */
UsersModel.prototype.endChat = function (nameHanger, nameOther) {

    // Check if users exist & are chatting
    if (this.areChatting(nameHanger, nameOther)) {
        console.log('endChat: ' + nameHanger + ' hung up on ' + nameOther);
        
        // Reset the toUser attributes
        this._users[nameHanger].toUser = null;
        this._users[nameOther].toUser = null;
        
        // Return the names of the users involved in the hangup
        return [nameOther, nameHanger];
    } else
        // Return null if they weren't chatting
        return null;
};
/**
 * Look up a socket by username
 * @param: name - The username
 * @return: The user's socket
 */
UsersModel.prototype.socket = function (name) {
    if (this._users[name])
        return this._users[name].socket;
    else
        return null;
};
/**
 * Emit to the socket of a use's userTo
 * @param: {String} name - A username
 * @param: {String} event - the event type to send
 * @param: {Obj} data - The data to send
 * @return: {boolean} - True if socket exists, false otherwise
 */
UsersModel.prototype.emit = function (name, event, data) {
    var socket = this.socket(name);
    
    console.log(event);
    
    if (socket) {
        socket.emit(event, data);
        return true;
    } else
        return false;
};
/**
 * Look by username the socket a user is talking to
 * @param: name - The username
 * @return: The user's socket
 */
UsersModel.prototype.toSocket = function (name) {
    if (this._users[name].toUser)
        return this._users[name].toUser.socket;
    else
        return null;
};
/**
 * Emit to the socket of a user's userTo
 * @param: {String} name - A username
 * @param: {String} event - the event type to send
 * @param: {Obj} data - The data to send
 * @return: {boolean} - True if socket exists, false otherwise
 */
UsersModel.prototype.toEmit = function (name, event, data) {
    var socket = this.toSocket(name);
    
    if (socket) {
        socket.emit(event, data);
        return true;
    } else
        return false;
};
/**
 * Get the name of the user a user is chatting with (if any)
 * @param: {String} name - A username
 * @return: {String} - The toUser name, or null
 */
UsersModel.prototype.toName = function (name) {
    var user = this._users[name];
    
    if (user && user.toUser)
        return user.toUser.name;
    else
        return '';
};
/**
 * Return an array of users with an open socket
 * @param: {String} skipName - A username to skip
 * @return: an array of JSON objects
 */
UsersModel.prototype.socketUsers = function (skipName) {
    var usersOnLine = [],
        users = this._users,
        name,
        user;
    
    for (name in users) {
        if (users.hasOwnProperty(name)) {
            // Get reference to the user instance
            user = users[name];
            // If it's not the one to skip:
            if (name !== skipName) {
                // Add username to userlist
                
                usersOnLine.push(name);
            }
        }
    }
    // Return the finished list
    return usersOnLine;
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
 * Check if the user is pending for anyone else
 * @param: {String} nameCalled - The potentially called username to check
 * @return {String} The name of the user calling the user, if any
 */
UsersModel.prototype.getPendingFrom = function (nameCalled) {
    var users = this._users,
        user, name,
        called = this._users[nameCalled];
    
    // Loop through users
    for (name in users) {
        if (users.hasOwnProperty(name)) {
            // Get reference to a user instance
            user = users[name];
            
            // If user has called as pending:
            if (user.pendingToUser === called) {
                // return the name of the caller
                return name;
            }
        }
    }
};
/**
 * Check if the user has any pending calls
 * @param: {String} nameCalled - The potentially called username to check
 * @return {String} The name of the pending user, if any
 */
UsersModel.prototype.getPendingTo = function (nameCaller) {
    var caller = this._users[nameCaller];
    
    // Make sure the user still exists
    if (caller) {
        if (caller.pendingToUser) {
            return caller.pendingToUser.name;
        }
    }
};
/**
 * Check if two users are marked as pending
 * @param: {String} nameCaller - The username of the user starting the call
 * @param: {String} nameCalled - The user being called
 * @return: {boolean} True if the caller has the called in their pending
 */
UsersModel.prototype.checkPending = function (nameCaller, nameCalled) {
    var users = this._users,
        res = false,
        caller = users[nameCaller];
    
    // Make sure the user exists before checking
    if (caller) { 
        // Return true if the caller shows as having a pending call to the called
        res = (caller.pendingToUser === users[nameCalled]);
    }
    
    return res;
};

// Export the UsersModel
module.exports = UsersModel;