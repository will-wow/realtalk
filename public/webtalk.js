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
    data[back] = true;
  }
  else if (event.which() === 13) {
    data[enter] = true;
  }
  else {
    data[char] = event.which();
  }
  
  return data;
}

// set up an io socket
var socket = io.connect();
var data = [];

$(document).ready(function() {
  // display a new received char
  $('textarea').keyPress(function (event) {
      var next = {
        "next": event.which()
      };
      socket.emit('char', next);
      console.log(next);
  });
  
  
  socket.on('char', function (char) {
    // build a div with the message
    var newElement = $('<div></div>').text(char.next);
    // add it to the message list
    $('#messages').append(newElement);
  });
  
});