'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:SignoutCtrl
 * @description
 * # SignoutCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('SignUpCtrl', ['Auth', 'New', function (Auth, New) {
    var scope = this;
    
    scope.head = "Sign Up to start talking!";
    scope.button = "Sign Up";
    
    scope.user = {
      username: '',
      password: ''
    };
    
    scope.submit = function () {
      Auth.signup(scope.username, scope.password);
    };
    
    /*
    scope.checkName = function () {
      New.get(function(data) {
        this.posts = data.posts;
        
        ctrl.$setValidity('uniqueEmail', data.isValid);
      });
    };
    */
  }]);
