'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:nav
 * @description
 * # nav
 */
 
angular.module('realtalkApp')
  .directive('nav', ['Auth', function (Auth) {
    return {
      templateUrl: 'views/templates/nav.html',
      restrict: 'E',
      controller: function () {
        this.auth = Auth.isSignedIn();
      },
      controllerAs: 'nav'
    };
  }]);