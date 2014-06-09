(function () {
  ////////////////////////////
  //  Public Variables
  ////////////////////////////
  // Holds reference to socket
  var socket,
  // Holds all current users
      users = [],
  // Var to hold the user being chatted with
      chattingWith = '';
  
  ////////////////////////////
  //  User List Functions
  ////////////////////////////
  function buildCalling(name) {
    var caller$ = $('\
      <h3>Calling ' + name + '...</h3>');
    
    return caller$;
  }
  
  function buildRing(name) {
    var ringer$ = $('\
      <form>\
        <h3><strong>' + name + '</strong> wants to chat!</h3>\
        <input type="button" id="pickup" value="Pick Up"/>\
        <input type="button" id="ignore" value="Ignore"/>\
      </form>');
    
    ringer$.find('#pickup').click(function () {
      socket.emit('pickup', name);
      ringer$.remove();
    });
    ringer$.find('#unavailable').click(function () {
      socket.emit('unavailable', name);
      ringer$.remove();
    });
    
    return ringer$;
  }
  
  ////////////////////////////
  //  Chooser Functions
  ////////////////////////////
  // Click handler for calling a user
  function userClickHandler(user) {
    return function () {
      $('#events').append(buildCalling(user));
      socket.emit('call',user);
    };
  }
  // Populate the userlist
  function populateList() {
    // Empty the current userlist
    $('#users').empty();
    
    // set up empty jQuery object to hold users
    var users$ = $('<div><h3>Users Online</h3>');
    
    // Loop through users array and add each one to DOM
    for (var user in users) {
      if(users.hasOwnProperty(user)){
        // set up the click handler for the user
        var clickHandler = userClickHandler(user);
        // build the user <p>, with the click handler
        var user$ = $('<p>' + user + '</p>')
                    .click(clickHandler);
        // append to the user object
        users$.append(user$);
      }
    }
    // append users to the DOM
    $('#users').append(users$);
  }
  function emptyEvents() {
    $('#events').empty();
  }
  
  ////////////////////////////
  //  Chat Functions
  ////////////////////////////
  
  // Add a character to a box
  function writeChar(id, char) {
    const MAX_LENGTH = 50;
    var textLength;
    
    // Get current text
    var text = $(id).val();
    // Append new character
    text = text + String.fromCharCode(char);
    // cut to MAX LENGTH
    textLength = text.length;
    if (textLength > MAX_LENGTH)
      text = text.substring(textLength-MAX_LENGTH, textLength);
    
    // Set new text
    $(id).val(text);
  }
  
  // empty a box
  function emptyBox(id) {
    $(id).val('');
  }
  
  // Remove a character from a box
  function removeChar(id) {
    var text = $(id).val();
    $(id).val(text.substring(0, text.length - 1));
  }
  
  // Decide what to do with a character
  function decideChar(id, char) {
    // Character is ENTER
    if (char === 13)
      emptyBox(id);
    else
      writeChar(id, char);
  }
  
  function clearChat() {
    emptyBox('#other');
    emptyBox('#me');
  }
  
  ////////////////////////////
  //  Event Handler Wrappers
  ////////////////////////////
  function addUserHandlers() {
    // Receive userlist
    socket.on('userlist', function (userArray) {
      // save userarray
      users = JSON.parse(userArray);
      // populate the userlist
      populateList();
    });
    // Add a user to the list
    socket.on('userIn', function (user) {
      users[user] = true;
      populateList();
    });
    // Remove a user from the list
    socket.on('userOut', function (user) {
      delete users[user];
      populateList();
    });
  }
  function addChooserHandlers() {
    //ring
    socket.on('ring', function (user) {
      console.log('ring');
      emptyEvents();
      $('#events').append(buildRing(user));
    });
    //unavailable
    socket.on('unavailable', function (user) {
      emptyEvents();
      $('#events').showCenteredMessage(user + ' was unavailable.');
    });
    //startchat
    socket.on('startchat', function (user) {
      var chat$ = $('#chat');
      emptyEvents();
      clearChat();
      chattingWith = user;
      // set other username
      chat$.find('#head-other').text(user);
      // show chat box
      chat$.fadeIn('fast');
    });
    //endchat
    socket.on('endchat', function (user) {
      var chat$ = $('#chat');
      chattingWith = '';
      // show chat box
      chat$.fadeOut('fast', function () {
        // clear other username
        $('#events').showCenteredMessage(
          user + ' has left the chat.', function () {
            chat$.find('#head-other').text('');
            clearChat();
        });
      });
    });
  }
  function addChatHandlers() {
    // User types character
    $(document).
    keypress(function (event) {
      if (!(chattingWith)) return;
      // Write character
      decideChar('#me',event.which);
      // Send character
      socket.emit('char', {"next": event.which});
      
      event.preventDefault();
    }).
    // User typed backspace
    keydown(function (event) {
      if (!(chattingWith)) return;
      if (event.which === 8) {
        // Remove character
        removeChar('#me');
        // Send a remove request
        socket.emit('back');
        
        event.preventDefault();
      }
    });
    
    // Receive character
    socket.on('char', function (char) {
      if (!(chattingWith)) return;
      decideChar('#other',char.next);
    });
    // Receive backspace
    socket.on('back', function () {
      if (!(chattingWith)) return;
      removeChar('#other');
    });
  }
  
  // Set up Socket & Handlers on document ready
  $(document).ready(function() {
    // set up an io socket & connect
    socket = io.connect('');
    
    socket.on('err',function (msg) {
      $('#events').showCenteredMessage(msg, {callback: function () {
        window.location.replace('/');
      }});
    });
    
    addUserHandlers();
    addChooserHandlers();
    addChatHandlers();
  });
})();