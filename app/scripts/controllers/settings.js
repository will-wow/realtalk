'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp').controller('SettingsCtrl', ['Me', function(Me) {
    var scope = this;

    scope.user = Me.query();

    scope.save = function() {
        Me.$save();
    };
}]);
