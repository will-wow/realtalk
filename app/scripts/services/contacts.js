'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.contacts
 * @description
 * # contacts
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('Contacts', ['$resource', function ($resource) {
    return $resource('/api/contacts/:contacts');
  }]);
