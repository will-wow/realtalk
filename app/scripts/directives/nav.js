'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:nav
 * @description
 * # nav
 */
 
angular.module('realtalkApp')
  .directive('nav', ['isLoggedIn', function (isLoggedIn) {
    return {
      templateUrl: 'views/templates/nav.html',
      restrict: 'E',
      controller: function () {
        this.auth = isLoggedIn();
      },
      controllerAs: 'nav'
    };
  }]);