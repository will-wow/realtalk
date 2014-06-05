(function () {

  function populateList(users) {
    $('.users').append('<code>'+users+'</code>');
  }
  
  $(document).ready(function() {
    // set up an io socket & connect
    var socket = io.connect('/chooser');
    
    // Receive userlist
    socket.on('userlist', populateList);
    
    //TODO: events
    
  });
})();