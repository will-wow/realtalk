var socketio = require('socket.io');
var io;
var room = 'chat';

// start up socket server
exports.listen = function(server) {
  // start Socket.IO server with HTTP server's port etc.
  io = socketio.listen(server);
  // limit the console logging
  io.set('log level', 1);
  // connection callbacks
  io.sockets.on('connection', function (socket) {
    // place user in the lobby room
    socket.join(room);
    
    socket.on('char', function (char) {
      socket.broadcast.to(room).emit('char', {
        next: char.next
      });
    });
    
  });
};
