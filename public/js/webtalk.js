(function () {
  // Create 
  var lastChat = {
    'me': new Date(),
    'other': new Date()
  };
  
  function getChar(char) {
    if (char.back) {
      // backspace
    }
    else if (char.enter) {
      // enter
    }
    else if (char.next) {
      // add a char
    }
  }
  
  function sendChar(event) {
    var data = [];
    
    if (event.which() === 8) {
      data['back'] = true;
    }
    else if (event.which() === 13) {
      data['enter'] = true;
    }
    else {
      data['char'] = event.which();
    }
    
    return data;
  }
  
  // Generate a new chat bubble
  function newBubble() {
    
  }
  
  // set up an io socket
  var socket = io.connect();
  var data = [];
  
  $(document).ready(function() {
    // User type character
    $(document).
    keypress(function (event) {
      // Write character
      
      
      // Send character
      var next = {
        "next": event.which
      };
      socket.emit('char', next);
      console.log(next);
    }).
    // User typed backspace
    keydown(function (event) {
      if (event.which === 8) {
        socket.emit('back');
        console.log('back');
      }
    });
    
    // Receive character
    socket.on('char', function (char) {
      $('#other').val($('#other').val() + String.fromCharCode(char.next));
    });
    // Receive backspace
    socket.on('back', function () {
      var text = $('#other').val();
      $('#other').val(text.substring(0, text.length - 1));
    });
    
  });
});