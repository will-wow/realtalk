'use strict';

/**
 * @ngdoc overview
 * @name realtalkApp
 * @description
 * # realtalkApp
 *
 * Main module of the application.
 */
angular.module('realtalkApp', [
  'ngRoute',
  'ngResource',
  'ui.gravatar'
  ])
.config(['gravatarServiceProvider', function(gravatarServiceProvider){
  gravatarServiceProvider.defaults = {
    "default": 'retro',
    "rating": 'r'
  };
}])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl',
    controllerAs: 'home'
  })
  .when('/signin', {
    templateUrl: 'views/sign.html',
    controller: 'SignInCtrl',
    controllerAs: 'sign'
  })
  .when('/signup', {
    templateUrl: 'views/sign.html',
    controller: 'SignUpCtrl',
    controllerAs: 'sign'
  })
  .when('/signout', {
    redirectTo: '/signin'
  })
  .when('/talk', {
    templateUrl: 'views/talk.html',
    controller: 'TalkCtrl',
    controllerAs: 'talk'
  })
  .when('/settings', {
    templateUrl: 'views/settings.html',
    controller: 'SettingsCtrl',
    controllerAs: 'settings',
  })
.otherwise({
    redirectTo: '/'
  });
}]);