'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.me
 * @description
 * # me
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('Me', ['$resource', function ($resource) {
    return $resource('/api/me');
  }]);
