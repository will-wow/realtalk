'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:nav
 * @description
 * # nav
 */
angular.module('realtalkApp')
  .directive('homenav', ['Auth', function (Auth) {
    return {
      templateUrl: 'views/templates/homenav.html',
      restrict: 'E',
      controller: function () {
        this.auth = Auth.isSignedIn();
      },
      controllerAs: 'nav'
    };
  }]);