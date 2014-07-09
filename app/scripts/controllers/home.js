'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('HomeCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
