'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.Socket
 * @description
 * # Socket
 * Socket.io wrapper service
 */
angular.module('realtalkApp').factory('Socket', ['$rootScope', function Socket($rootScope) {
  var socket = io.connect('http://localhost:8080');
  return {
    // socket.on
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);