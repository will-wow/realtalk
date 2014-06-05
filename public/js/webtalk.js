(function () {
  // Create 
  var lastChat = {
    'me': new Date(),
    'other': new Date()
  };
  
  ////////////////////////////
  //  Typing functions
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
  
  ///////
  //  Other functions
  //////
  
  // Decide what to do with a character
  function decideChar(id, char) {
    // Character is ENTER
    if (char === 13)
      emptyBox(id);
    else
      writeChar(id, char);
  }
  
  ////////////////////////////
  //  Main
  ////////////////////////////
  
  $(document).ready(function() {
    // set up an io socket
    var socket = io.connect();
    
    // User types character
    $(document).
    keypress(function (event) {
      // Write character
      decideChar('#me',event.which);
      // Send character
      socket.emit('char', {"next": event.which});
    }).
    // User typed backspace
    keydown(function (event) {
      if (event.which === 8) {
        // Remove character
        removeChar('#me');
        // Send a remove request
        socket.emit('back');
      }
    });
    
    // Receive character
    socket.on('char', function (char) {
      decideChar('#other',char.next);
    });
    // Receive backspace
    socket.on('back', function () {
      removeChar('#other');
    });
    
  });
})();