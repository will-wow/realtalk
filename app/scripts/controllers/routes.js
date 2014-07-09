'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:RoutesCtrl
 * @description
 * # RoutesCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp').config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl'
  })
  /*
  .when('/talk', {
    templateUrl: 'views/talk.html',
    controller: 'TalkCtrl'
  })
  */
  .otherwise({
    redirectTo: '/'
  });
}]);