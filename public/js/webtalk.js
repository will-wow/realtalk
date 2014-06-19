/*TODO:
Refactor for OOP
*/
(function($, io) {
    // "use strict";
    var socket,
        chatModel,
        chatView,
        emptyView,
        messageModel,
        messageView,
        usersModel,
        usersView;
    
    /**
     * Build a setSize function
     * @param {jQuery} box - The element to work on
     * @param {String} classClosed - The class to use when the box is closed
     * @param {String} classSelf - The class to use when only this box is open
     * @param {String} classBoth - The class to use when both boxes are open
     * @return The setSize function for a box
     */
    function setSize(box, classClosed, classSelf, classBoth) {
        return function (thisOpen, otherOpen) {
            box = $(box);
            if (!thisOpen) {
                // This is closed
                box
                    .removeClass(classSelf + ' ' + classBoth)
                    .addClass(classClosed);
            } else {
                // This is open
                if (otherOpen) {
                    // Other is also open
                    box
                        .removeClass(classSelf + ' ' + classClosed)
                        .addClass(classBoth);
                } else {
                    // Other is closed
                    box
                        .removeClass(classBoth + ' ' + classClosed)
                        .addClass(classSelf);
                }
            }
        };
    }
    
    ////////////////////////////
    //  Button Class
    ////////////////////////////
    /**
     * Class for generating buttons
     * @param value - The button text
     * @param onClick - The button's click handler
     */
    function Btn(value, onClick) {
        this.value = value || '';
        this.onClick = onClick;
    }

    ////////////////////////////
    //  User MVC
    ////////////////////////////
    /**
     * User Model
     */
    function User(username, available) {
        this.name = username;
        this.available = available;
    }
    /**
     * Users Model
     */
    function UsersModel() {
        this._users = [];
    }
    UsersModel.prototype = {
        _sortUsers: function () {
            this._users.sort(function (a,b){
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
        },
        /**
         * Add a user to the list
         * @param: {User} user - the new User instance
         */
        addUser: function (username, available) {
            this._users.push(new User(username, available));
            this._sortUsers();
        },
        /**
         * Remove a user from the list
         * @param: {String} name - the username to remove
         */
        removeUser: function (username) {
            var users = this._users,
                i = 0;
            for (i; i < users.length; i++) {
                if (users[i].name === username) {
                    users.splice(i,1);
                    return;
                }
            }
        },
        setAvailable: function (username, available) {
            var users = this._users,
                i = 0;
            for (i; i < users.length; i++) {
                if (users[i].name === username) {
                    users[i].available = available;
                    return;
                }
            }
        },
        /**
         * Return the userlist
         */
        getUsers: function () {
            // Return sorted list of Users
            return this._users;
        }
    };
    /**
     * Users View
     */
    function UsersView(userClickHandler) {
        this._userClickHandler = userClickHandler;
    }
    UsersView.prototype = {
        // Populate the userlist
        populateList: function (users) {
            // set up empty jQuery object to hold users
            var users$ = $(),
                i, user$,
                username;
            
            // Loop through users array and add each one to DOM
            for (i in users) {
                if (users.hasOwnProperty(i)) {
                    // get the users's name
                    username = users[i].name;
                    // set up their list item
                    user$ = $('<li><a>' + username + '</a></li>');
                    // set up the click handler for the user
                    user$.click(this._userClickHandler(username));
                    
                    // If unavailable, mark it
                    if (!users[i].available) 
                        user$.addClass("user-unavailable");
                        
                    // append user to the users object
                    users$ = users$.add(user$);
                }
            }
            // append users to the DOM
            $('#users').empty().append(users$);
        }
    };
    
    
    ////////////////////////////
    //  Message MVC
    ////////////////////////////
    /**
     * Message Model
     */
    function MessageModel() {
        // State of the message popup
        this._open = false;
        // The message info
        this._header = '';
        this._text = '';
        this._yesBtn = null;
        this._noBtn = null;
        // Message type
        this._type = this.types.UNAVAILABLE;
    }
    MessageModel.prototype = {
        /**
         * Enum of type options
         * Not sure if this will be useful
         */
        types: {
            UNAVAILABLE: true,
            CALL: false,
            RING: false,
            HUNGUP: true,
            ERR: true,
            CLOSED: true
        },
        /**
         * Return the state of the message model
         */
        getMessage: function() {
            return {
                open: this._open || false,
                header: this._header || ' ',
                text: this._text || ' ',
                yesBtn: this._yesBtn || new Btn("OK"),
                noBtn: this._noBtn || new Btn("Cancel"),
            };
        },
        /**
         * Return the current message type
         */
        canReplace: function () {
            return this._type;
        },
        /**
         * Send in new values to the message model. 
         */
        setMessage: function(open, type, header, text, yesBtn, noBtn) {
            // Update model
            this._open = open;
            this._type = type;
            this._header = header;
            this._text = text;
            this._yesBtn = yesBtn;
            this._noBtn = noBtn;
        },
        /**
         * Set the open status
         */
        setOpen: function(open) {
            this._open = open;
        },
        /**
         * Get the open status
         */
        getOpen: function() {
            return this._open;
        },
    };
    /**
     * Message View
     */
    function MessageView () {
        var msg;
        // Set up references to parts of the event view
        this._msg = msg = $('#message');
        this._header = msg.find('#event-header');
        this._text = msg.find('#event-text');
        this._yes = msg.find('#event-yes');
        this._no = msg.find('#event-no');
        /**
         * Set the message size class
         * @param {boolean} messageOpen - Open state of the message box
         * @param {boolean} chatOpen - Open state of the chat box
         */
        this.setSize = setSize(this._msg,'zero-width','col-md-offset-4','col-md-offset-1');
    }
    MessageView.prototype = {
        /**
         * Set up a button
         * @param name - Name of the button (yes/no)
         * @param classname - Name of the css class for the button
         * @param btn - The button model object to use
         */
        _setButton: function(name, classname, btn) {
            // Add _ to get the property name
            name = '_' + name;

            // Set the button's value
            this[name].val(btn.value);
            // Deal with click handler
            if (btn.onClick) {
                // If there is one:
                this[name]
                    // Add the handler
                    .click(btn.onClick)
                    // Add the given class name to style the btn
                    .addClass(classname);
            }
            else {
                // if no handler
                this[name]
                    // remove the given class to gray out the btn
                    .removeClass(classname)
                    // remove any click handlers
                    .off('click');
            }
        },
        /**
         * Set up the message box
         * @param message - The message object from the controller
         */
        setUpMsg: function(message) {
            // Add header text (HTML Okay)
            this._header.html(message.header);
            // Add description text (HTML Okay)
            this._text.html(message.text);
            // set up yes btn
            this._setButton('yes', 'btn-success', message.yesBtn);
            // set up no btn
            this._setButton('no', 'btn-danger', message.noBtn);
        }
    };


    ////////////////////////////
    //  Chat MVC
    ////////////////////////////
    /**
     * Chat Model
     */
    function ChatModel() {
        // If true, chat is open
        this._open = false;
        // The user being chatted with
        this._chattingWith = null;
        // The user's chat string
        this._meTxt = '';
        // The other user's chat string
        this._otherTxt = '',
        // The max length of a text string
        this._MAX_LENGTH = 50;
    }
    ChatModel.prototype = {
        // Chooser methods
        setOpen: function (open) {
            this._open = open;
        },
        getOpen: function () {
            return this._open;
        },
        setChattingWith: function (chattingWith) {
            this._chattingWith = chattingWith;
        },
        getChattingWith: function () {
            return this._chattingWith;
        },
        endChat: function () {
            this.setChattingWith(null);
            this.setOpen(false);
            this.emptyChat('me');
            this.emptyChat('other');
        },
        startChat: function (username) {
            this.emptyChat('me');
            this.emptyChat('other');
            this.setChattingWith(username);
            this.setOpen(true);
        },
        // Chat methods
        /**
         * Return the name of a userTxt variable
         * @param: {String} userType - Either "me" or "other"
         */
        _txtRef: function (userType) {
            return '_' + userType + 'Txt';
        },
        /**
         * Add input to a chat box
         * @param: {String} input - The input to add
         * @param: {String} userType - Either "me" or "other"
         */
        writeInput: function (userType, input) {
            // Don't update if not chatting
            if (!(this.getChattingWith())) return;
            
            // Get the name of the referenced txt variable
            var textRef = this._txtRef(userType),
            // The current text
                text = this[textRef],
            // The length of the current text + input
                textLength;

            // Append new characters
            text = text + input;
            // Get new length
            textLength = text.length;
            // Cut to MAX_LENGTH
            if (textLength > this._MAX_LENGTH) {
                text = text.substring(textLength - this._MAX_LENGTH, textLength);
            }
    
            // Set new text
            this[textRef] = text;
        },
        /**
         * Remove a character from a box
         * @param: {String} userType - Either "me" or "other"
         */
        removeChar: function (userType) {
            // Don't update if not chatting
            if (!(this.getChattingWith())) return;
            
            var textRef = this._txtRef(userType),
            // The current text
                text = this[textRef];
            // Remove one char from the text
            this[textRef] = text.substring(0, text.length - 1);
        },
        /**
         * Empty a chat String
         * @param: {String} userType - Either "me" or "other"
         */
        emptyChat: function (userType) {
            this[this._txtRef(userType)] = '';
        },
        /**
         * Decide what to do with an input String (that starts with a space)
         * @param: {String} userType - Either "me" or "other"
         */
        decideInput: function (input) {
            // Don't update if not chatting
            if (!(this.getChattingWith())) return;
    
            if (input) {
                // User typed a string
                // Remove the first character, which is there to handle backspace
                input = input.substring(1, input.length);
                // Type the string into the #me box
                this.writeInput('me', input);
                // Send it to the server
                socket.emit('input', input);
            }
            else {
                // User hit backspace
                this.removeChar('me');
                socket.emit('back');
            }
        },
        getCurrentText: function (userType) {
            return this[this._txtRef(userType)];
        }
    };
    /**
     * Chat View
     */
    function ChatView () {
        var chat;
        // Get refs to the DOM
        this._chat  = chat = $('#chat');
        this._quit  = chat.find('#quit');
        this._me    = chat.find('#me');
        this._meHead = chat.find('#head-me');
        this._other = chat.find('#other');
        this._otherHead = chat.find('#head-other');
        this.setSize = setSize(this._chat,'zero-width','col-md-offset-3','col-md-offset-1');
    }
    ChatView.prototype = {
        _setHead: function (id, text) {
            this['_' + id + 'Head'].text(text || ' ');
        },
        /**
         * Empty a chat box
         */
        startChat: function (username) {
            // Clear chatting var
            this._setHead('other',username);
            this.updateChat('me','');
            this.updateChat('other','');
        },
        /**
         * Do the work when a chat ends
         * Can be called when hanging up, or being hung up on
         */
        closeChat: function () {
            // Clear chatting var
            this._setHead('other',' ');
            this.updateChat('me','');
            this.updateChat('other','');
        },
        // Chat methods
        /**
         * Update the contents of a chat box
         * @param {String} id - The ID of the chat box (me or other)
         * @param {String} text - The text to add to the box
         */
        updateChat: function (id, text) {
            this['_' + id].val(text);
        }
    };
    
    /**
     * View for when both chat and message are closed
     */
    function EmptyView() {
        this._empty = $('#empty');
        this.setSize = setSize(this._empty, '','col-xs-12','zero-width');
    }
    
    
    ////////////////////////////
    //  Controller
    ////////////////////////////
    /**
     * Set the sizes of the boxes based on their status
     */
    function setSizes() {
        var chatOpen = chatModel.getOpen(),
            messageOpen = messageModel.getOpen();
        
        chatView.setSize(chatOpen, messageOpen);
        messageView.setSize(messageOpen, chatOpen);
        emptyView.setSize(true, chatOpen || messageOpen);
    }
    ///////////////////
    // User Handlers
    ///////////////////
    // Click handler for calling a user
    function userClickHandler (username) {
        return function () {
            // Show the calling event box
            msgNew(messageModel.types.CALL,
                'Calling <strong>' + username + '</strong>...', '',
                null,
                // Allow user to cancel call
                new Btn('Cancel', function() {
                    socket.emit('cancelRing', username);
                    msgClose();
                }));

            socket.emit('call', username);
        };
    }
    function userlistHandler(users) {
        //TODO
    }
    function userInHandler(username, available) {
        usersModel.addUser(username, available);
        usersView.populateList(usersModel.getUsers());
    }
    function userOutHandler(username) {
        usersModel.removeUser(username);
        usersView.populateList(usersModel.getUsers());
    }
    function userAvailabilityHandler(username, available) {
        usersModel.setAvailable(username, available);
        usersView.populateList(usersModel.getUsers());
    }
    
    ///////////////////
    // Messge Handlers
    ///////////////////
    /**
     * Open a new message
     * @param {boolean} dontSetSizes=false - If true, don't run setSizes
     */
    function msgNew(type, header, text, yesBtn, noBtn, dontSetSizes) {
        // Send the message to the Model
        messageModel.setMessage(true, type, header, text, yesBtn, noBtn);
        // Push the message to the View
        messageView.setUpMsg(messageModel.getMessage());
        
        // Update the box sizes
        if (!dontSetSizes) {
            setSizes();
            collapseNav();
        }
    }
    /**
     * Close the current message
     * @param {boolean} dontSetSizes=false - If true, don't run setSizes
     */
    function msgClose(dontSetSizes) {
        // Clear the model
        messageModel.setMessage(false, messageModel.types.CLOSED);
        // Push the message to the View
        messageView.setUpMsg(messageModel.getMessage());
        // Update the box sizes
        if (!dontSetSizes)
            setSizes();
    }
    
    ////////////////////////////
    //  Chooser Handlers
    ////////////////////////////
    /**
     * End a chat
     * @param {boolean} dontSetSizes=false - If true, don't run setSizes
     */
    function chatEnd(dontSetSizes) {
        chatModel.endChat();
        chatView.closeChat();
        // Update the box sizes
        if (!dontSetSizes)
            setSizes();
    }
    /**
     * Start a chat
     * @param {boolean} dontSetSizes=false - If true, don't run setSizes
     */
    function chatStart (username, dontSetSizes) {
        chatModel.startChat(username);
        chatView.startChat(username);
        // Update the box sizes
        if (!dontSetSizes) {
            setSizes();
            collapseNav();
        }
    }
    /**
     * Handle a hang-up from the user
     */
    function hangUpHandler() {
        // Send hangup event
        socket.emit('hangup', chatModel.getChattingWith());
        // End Chat
        chatEnd();
    }
    /**
     * Handle a hang-up from the other user 
     */
    function hungUpHandler(username) {
        // Show a chatend message if the current message is replaceable
        if (messageModel.canReplace()) {
            // Display event about hangup
            // Don't reset the sizes (done next)
            msgNew(messageModel.types.HUNGUP, 
                username + " has left the chat.", "You can choose someone else to chat with.",
                // Add OK button that closes the message
                new Btn("OK",function () {
                    // close the message
                    msgClose();
                    }),true);
        } 
        // End Chat either way
        chatEnd();
    }
    /**
     * Handle a ring event 
     */
    function ringHandler(username) {
        // if the current message is replaceable, accept the ring
        if (messageModel.canReplace()) {
            msgNew(messageModel.types.RING,
                '<strong>' + username + '</strong> wants to chat!', '',
                // Click Chat to start chat
                new Btn('Chat', function() {
                    socket.emit('pickup', username);
                }),
                // Click Busy to ignore
                new Btn('Busy', function() {
                    socket.emit('unavailable', username);
                    msgClose();
                }));
        // If the current message is not replaceable
        } else {
            // Respond with unavailable
            socket.emit('unavailable', username);
        }
    }
    function cancelRingHandler() {
        msgClose();
    }
    /**
     * Handle a pick-up event
     */
    function startChatHandler(username) {
        msgClose(true);
        chatStart(username);
        inputFocus();
    }
    /**
     * Handle an event where the other user was unavailable
     */
    function unavailableHandler(username) {
        msgNew(messageModel.types.UNAVAILABLE,
            username + ' was unavailable.', '', new Btn('OK', function () {
            msgClose();
        }));
    }
    
    ///////////////////
    // Chat Handlers
    ///////////////////
    /**
     * Add a character to a box
     */ 
    function inputHandler() {
        var input$ = $(this);
        
        // Decide what to do with the input in the model
        chatModel.decideInput(input$.val());
        // Clear the input box
        input$.val(' ');
        // Update the chatbox
        chatView.updateChat('me', chatModel.getCurrentText('me'));
    }
    /**
     * Listen for keypresses
     */ 
    function keyHandler(e) {
        var key = e.which;
        
        if (key === 13) {
            chatModel.emptyChat('me');
            chatView.updateChat('me', chatModel.getCurrentText('me'));
            socket.emit('clear');
            e.preventDefault();
       }
    }
    /**
     * Add a character to the #other box
     * @param {String} text - The text to write
     */ 
    function textInHandler(text) {
        chatModel.writeInput('other', text);
        chatView.updateChat('other', chatModel.getCurrentText('other'));
    }
    /**
     * Remove a char from the #other box
     */ 
    function removeHandler() {
        chatModel.removeChar('other');
        chatView.updateChat('other', chatModel.getCurrentText('other'));
    }
    /**
     * Clear the #other box
     */ 
    function clearHandler() {
        chatModel.emptyChat('other');
        chatView.updateChat('other', chatModel.getCurrentText('other'));
    }
    
    ///////////////////
    // Other handlers
    ///////////////////
    /**
     * Bring up a message on a server error
     */ 
    function errorHandler() {
        msgNew(messageModel.types.ERR,
            "Authentication Error", "Please sign in before chatting.",
            new Btn("OK", function() {
                window.location.replace('/');
            })
        );
    }
    /**
     * Focus on the inputBox
     */ 
    function inputFocus () {
        $('#input')
            // Focus on the input box
            .focus()
            // Reset the val after focus to put the cursor on the 2nd char
            .val(' ');
    }
    /**
     * Collapse the nav bar
     */ 
    function collapseNav() {
        $('.navbar-collapse.collapse.in').collapse('hide');
    }

    // Set up Socket & Handlers on document ready
    $(document).ready(function() {
        socket = io.connect(''),
        chatModel = new ChatModel(),
        chatView = new ChatView(),
        emptyView = new EmptyView(),
        messageModel = new MessageModel(),
        messageView = new MessageView(),
        usersModel = new UsersModel(),
        usersView = new UsersView(userClickHandler);
        
        //Error handler
        socket.on('err', errorHandler);

        ////////////////////////////
        //  User Events
        ////////////////////////////
        // Receive userlist
        socket
            .on('userlist', function (users) {
                console.log('ready');
        
                // save userarray
                usersModel._users = users;
                // populate the userlist
                usersView.populateList(usersModel.getUsers());
            })
            // Add a user to the list
            .on('userIn', function (user) {
                userInHandler(user.name, user.available);
            })
            // Remove a user from the list
            .on('userOut', userOutHandler)
            // Remove a user from the list
            .on('userAvailability', function (user) {
                userAvailabilityHandler(user.username, user.available);
            });
        
        ////////////////////////////
        //  Chooser Events
        ////////////////////////////
        // Quit button
        chatView._quit.click(hangUpHandler);
    
        //Socket.io events
        socket
            //Ring
            .on('ring', ringHandler)
            //Cancel Ring
            .on('cancelRing', cancelRingHandler)
            //unavailable
            .on('unavailable', unavailableHandler)
            //startchat
            .on('startchat', startChatHandler)
            //endchat
            .on('hungup', hungUpHandler);
        
        
        ////////////////////////////
        //  Chat Events
        ////////////////////////////
    
        // User types character
        $('#input').on("textchange", inputHandler);
        $('#input').on("keydown", keyHandler);
        
        // Receive input
        socket
            // Receive text
            .on('input', textInHandler)
            // Receive backspace
            .on('back', removeHandler)
            // Receive clearbox
            .on('clear', clearHandler);
            
        // Keep the focus on the chat box
        $(document).click(inputFocus);
    });
})(jQuery, io);