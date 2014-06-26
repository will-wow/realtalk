/* BACKBONE 
var TalkClient = function (options) {
  // grab reference now to avoid conficts
  var self = this;
  
  // app event bus
  self.event = options.event;
  
  // server connector
  self.connect = function () {
    // connect
    self.socket = io.connect('');
    
    // set up listeners
    self.setResponseListeners(self.socket);
  }
  
  //=========================
  // Chat Out Handlers ======
  //=========================
  // Send text
  self.input = function (input) {
    self.socket.emit('input', input);
  };
  
  // Send backspace
  self.back = function () {
    self.socket.emit('back');
  };
  
  // Send clearbox
  self.clear = function () {
    self.socket.emit('clear');
  };
  
  //=========================
  // Chat In Handlers =======
  //=========================
  self.setResponseListeners = function (socket) {
    socket
      // Receive text
      .on('input', function (input) {
        self.event.trigger('input', input);
      })
      .on('back', function () {
        self.event.trigger('back');
      })
      .on('clear', function () {
        self.event.trigger('clear');
      });
    
  };
};
*/