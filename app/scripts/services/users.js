'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.Users
 * @description
 * # Users
 * Get info about other users
 */
angular.module('realtalkApp')
  .factory('Users', ['$resource', function ($resource) {
    return $resource('/api/users/:users');
  }]);
