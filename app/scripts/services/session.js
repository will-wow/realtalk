'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.Session
 * @description
 * # Session
 * Service in the realtalkApp.
 */
angular.module('realtalkApp').service('Session', function Session() {
  this.create = function(username, password) {
    this.username = username;
    this.password = password;
  };
  this.destroy = function() {
    this.username = null;
    this.password = null;
  };
  this.isloggedin = function () {
    return !!this.username;
  }
  return this;
});
