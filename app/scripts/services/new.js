'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.new
 * @description
 * # new
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('New', ['$resource', function ($resource) {
    return $resource('/api/new/:username');
  }]);