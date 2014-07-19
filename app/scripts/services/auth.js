'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.auth
 * @description
 * # auth
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('Auth', ['$location', 'Session', 'Me', 'SignIn', function ($location, Session, Me, SignIn) {
    // Callback after sign in/up 
    var signCallback = function(res) {
      if (res) {
        // Save info to session
        Session.create(username, password);
        // Move back to home
        $location.path('/');
      }
      else {
        // TODO: INVALID
      }
    };
    
    return {
      signup: function (username, password) {
        Me.save({}, {
          username: username,
          password: password
        }, signCallback);
      },
      // Set Session if authorized
      signin: function (username, password) {
        SignIn.get({}, signCallback);
      },
      signout: function () {
        Session.destroy();
      },
      isSignedIn: function () {
        return Session.isloggedin();
      }
    };
  }]);
