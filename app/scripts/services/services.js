'use strict';

/* TODO: add auth */

/**
 * @ngdoc service
 * @name realtalkApp.Services
 * @description
 * # Services
 * Service in the realtalkApp.
 */
angular.module('realtalkApp.services')
  .factory('services', ['$http', function ($http) {
    var services = {},
        urlBase = '/';
    
    
    services.nav = function () {
      return $http.get(urlBase + 'nav');
    };
    
    services.footer = function () {
      return $http.get(urlBase + 'footer');
    };
    
    return services;
  }]);