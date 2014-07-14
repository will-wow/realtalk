'use strict';

/**
 * @ngdoc overview
 * @name 874954App
 * @description
 * # 874954App
 *
 * Main module of the application.
 */
angular.module('realtalkApp', [
  'ngRoute'
  ])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl',
    controllerAs: 'home'
  })
  .when('/talk', {
    templateUrl: 'views/talk.html',
    controller: 'TalkCtrl',
    controllerAs: 'talk'
  })
.when('/settings', {
  templateUrl: 'views/settings.html',
  controller: 'SettingsCtrl'
})
.otherwise({
    redirectTo: '/'
  });
}]);