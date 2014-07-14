'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.Isloggedin
 * @description
 * # Isloggedin
 * Figure out if user is logged in
 */
angular.module('realtalkApp')
  .factory('Isloggedin', function Isloggedin() {
    var auth = functon () {
      return true;
    }
    
    return auth;
  });
