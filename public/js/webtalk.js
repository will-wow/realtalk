/*TODO:
Implement disconnect events
Refactor for OOP
Implement http://backbonejs.org/?
*/
(function ($) {
  ////////////////////////////
  //  Public Variables
  ////////////////////////////
  // "use strict";
  // Holds reference to socket
  var socket,
  // Holds all current users
    users = {},
  // Var to hold the user being chatted with
    chattingWith = '',
  // Holds the #event jQuery element references
    event = [],
  // Holds the #Chat refs
    chat = [],
    Btn = function (value, onClick) {
      this.value = value || '';
      this.onClick = onClick;
    };
  
  ////////////////////////////
  //  Event Functions
  ////////////////////////////
  
  // Get references to all the event elements
  function findElements() {
    var event$ = $('#event'), chat$ = $('#chat');
    
    event.event = event$;
    event.header = event$.find('#event-header');
    event.text = event$.find('#event-text');
    event.yes = event$.find('#event-yes');
    event.no = event$.find('#event-no');
    
    chat.chat = chat$;
    chat.quit = chat$.find('#quit');
    chat.me = chat$.find('#me');
    chat.other = chat$.find('#other');
  }
  
  // Set up the event box
  function buildEvent(header, text, yesBtn, noBtn) {
    // Defaults
    yesBtn = yesBtn || new Btn("OK");
    noBtn = noBtn || new Btn("Cancel");
    
    // Add header text (HTML Okay)
    event.header.html(header || ' ');
    // Add description text (HTML Okay)
    event.text.html(text || ' ');
    
    // set up yes btn
    event.yes.val(yesBtn.value);
    if (yesBtn.onClick) {
      event.yes
        .click(yesBtn.onClick)
        .addClass('btn-success');
    } else {
      event.yes
        .removeClass('btn-success')
        .off('click');
    }
    
    // Set up no btn
    event.no.val(noBtn.value);
    if (noBtn.onClick) {
      event.no
        .click(noBtn.onClick)
        .addClass('btn-danger');
    } else {
      event.no
        .removeClass('btn-danger')
        .off('click');
    }
  }
  
  // Fade the event box in, and move the chat box over
  function fadeInEvent() {
    event.event.removeClass('zero-width');
    chat.chat.toggleClass('col-md-offset-1', 'col-md-offset-3');
  }
  // Fade the event box in, and move the chat box over
  function fadeOutEvent() {
    event.event.addClass('zero-width');
    chat.chat.toggleClass('col-md-offset-1', 'col-md-offset-3');
  }
  
  function showEvent(header, text, yesBtn, noBtn) {
    // Set up the event div
    buildEvent(header, text, yesBtn, noBtn);
    fadeInEvent();
  }
  
  function hideEvent() {
    // empty the event box
    buildEvent();
    fadeOutEvent();
  }
  
  ////////////////////////////
  //  Chooser Functions
  ////////////////////////////
  // Click handler for calling a user
  function userClickHandler(user) {
    return function () {
      // Show the calling event box
      showEvent('Calling <strong>' + user + '</strong>...', '',
        null,
        // Allow user to cancel call
        new Btn('Cancel', function () {
          socket.emit('call-cancel', user);
          hideEvent();
        })
        );
      
      socket.emit('call', user);
    };
  }
  
  /**
   * Do the work when a chat ends
   * Can be called when hanging up, or being hung up on
   */
  function chatEnder() {
    // Clear chatting var
    chattingWith = '';
    chat.chat.find('#head-other').text(' ');
    clearChat();
  }
  
  /**
   * Hang up a chat
   */
  function hangUpHandler() {
    // Send hangup event
    socket.emit('hangup', chattingWith);
    // Clean up chat
    chatEnder();
  }
  
  /**
   * Handle a hang-up event 
   */
  function hungUpHandler(user) {
    // Display event about hangup
    showEvent(user + " has left the chat.", "You can choose someone else to chat with.",
      new Btn("OK", hideEvent));
    // Clean up chat
    chatEnder();
  }
  
  // Populate the userlist
  function populateList() {
    // set up empty jQuery object to hold users
    var users$ = $(), user, clickHandler, user$;
    
    // Loop through users array and add each one to DOM
    for (user in users) {
      if (users.hasOwnProperty(user)) {
        // set up the click handler for the user
        clickHandler = userClickHandler(user);
        // build the user <p>, with the click handler
        user$ = $('<li><a>' + user + '</a></li>')
                    .click(clickHandler);
        // append to the user object
        users$ = users$.add(user$);
      }
    }
    // append users to the DOM
    $('#users').empty().append(users$);
  }
  function emptyEvents() {
    $('#events').empty();
  }
  
  ////////////////////////////
  //  Chat Functions
  ////////////////////////////
  
  /**
   * Empty a chat box
   */
  function emptyBox(id) {
    $(id).val('');
  }
  
  /**
   * Clear the chat boxes
   */
  function clearChat() {
    emptyBox('#other');
    emptyBox('#me');
  }
  
  /**
   * Add a character to a box
   */
  function writeChar(id, char) {
    var MAX_LENGTH = 50,
      textLength,
      text;
    
    // Get current text
    text = $(id).val();
    // Append new character
    text = text + String.fromCharCode(char);
    // cut to MAX LENGTH
    textLength = text.length;
    if (textLength > MAX_LENGTH) {
      text = text.substring(textLength - MAX_LENGTH, textLength);
    }
    
    // Set new text
    $(id).val(text);
  }
  
  function writeInput(id, input) {
    var MAX_LENGTH = 50,
      textLength,
      text;
      
    // Get current text
    text = $(id).val();
    // Append new character
    text = text + input;
    // cut to MAX LENGTH
    textLength = text.length;
    if (textLength > MAX_LENGTH) {
      text = text.substring(textLength - MAX_LENGTH, textLength);
    }
    
    // Set new text
    $(id).val(text);
  }
  
  // Remove a character from a box
  function removeChar(id) {
    var text = $(id).val();
    $(id).val(text.substring(0, text.length - 1));
  }
  
  function handleKeys(e) {
    if (!(chattingWith)) return;
    var key = e.which,
      id = '#me';
    
    // Backspace works fine as keydown outside Firefox
    if (e.type === "keydown") {
      // Backspace
      if (key === 8) {
        //if (!($.browser.mozilla)) {
        removeChar(id);
        socket.emit('back');
        //}
        e.preventDefault();
      }
    // All other events are keypress
    } else if (e.type === "keypress") {
      // Backspace repeats as keypress in Firefox
      if (key === 8) {
        removeChar(id);
        socket.emit('back');
      // Send ENTER
      } else if (key === 13) {
        emptyBox(id);
        socket.emit('clear');
      // Send Characters
      } else if (32 <= key && key <= 126) {
        writeChar(id, key);
        socket.emit('char', key);
      }
      e.preventDefault();
    }
  }
  
  function handleBackspace(e) {
    if (!(chattingWith)) return;
    var key = e.which,
      id = '#me';
    
    if (key === 8) {
      removeChar(id);
      socket.emit('back');
      e.preventDefault();
    } else if (key === 13) {
      emptyBox(id);
      socket.emit('clear');
      e.preventDefault();
    }
  }
  
  function handleInput() {
    if (!(chattingWith)) return;
    
    var input$ = $(this),
      val = input$.val();
    
    if (val) {
      // User typed a string
      // Remove the first character, which is there to handle backspace
      val = val.substring(1,val.length);
      // Type the string into the #me box
      writeInput('#me',val);
      // Send it to the server
      socket.emit('input', val);
    } else {
      // User hit backspace
      removeChar('#me');
      socket.emit('back');
    }
    // reset the input box
    input$.val(' ');
  }
  
  
  ////////////////////////////
  //  Event Handler Wrappers
  ////////////////////////////
  function addUserHandlers() {
    // Receive userlist
    socket.on('userlist', function (userArray) {
      console.log('userlist');
      
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
    // Quit button
    chat.quit.click(hangUpHandler);
    
    //Socket.io events
    socket
      //Ring
      .on('ring', function (user) {
        // Show the Ring event box
        showEvent('<strong>' + user + '</strong> wants to chat!', '',
          new Btn('Chat', function () {
            socket.emit('pickup', user);
          }),
          new Btn('Busy', function () {
            socket.emit('unavailable', user);
            hideEvent();
          })
          );
      })
      //unavailable
      .on('unavailable', function (user) {
        // Show the Ring event box
        showEvent(user + ' was unavailable.', '', new Btn('OK',hideEvent));
      })
      //startchat
      .on('startchat', function (user) {
        var chat$ = $('#chat');
        hideEvent();
        clearChat();
        chattingWith = user;
        
        // set other username
        chat$.find('#head-other').text(user);
      })
      //endchat
      .on('hungup',hungUpHandler);
  }
  function addChatHandlers() {
    // User types character
    
    $('#input')
      .keypress(handleBackspace)
      // User typed backspace
      .keydown(handleBackspace)
      .on("textchange", handleInput);
    
    // Receive character
    socket
      .on('char', function (char) {
        if (!(chattingWith)) return;
        writeChar('#other', char);
      })
      // Receive input
      .on('input', function (input) {
        if (!(chattingWith)) return;
        writeInput('#other', input);
      })
      // Receive backspace
      .on('back', function () {
        if (!(chattingWith)) return;
        removeChar('#other');
      })
      // Receive clearbox
      .on('clear', function () {
        if (!(chattingWith)) return;
        emptyBox('#other');
      });
  }
  
  // Set up Socket & Handlers on document ready
  $(document).ready(function () {
    // set up an io socket & connect
    socket = io.connect('');
    
    findElements();
    
    socket.on('err', function (msg) {
      showEvent("Authentication Error", "Please sign in before chatting.",
        new Btn("OK", function () {window.location.replace('/'); }));
    });
    
    addUserHandlers();
    addChooserHandlers();
    addChatHandlers();
    
    $(document).click(function () {
      $('#input').focus();
    });
  });
})(jQuery);