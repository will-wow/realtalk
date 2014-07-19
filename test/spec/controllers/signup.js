'use strict';

describe('Controller: SignupCtrl', function () {

  // load the controller's module
  beforeEach(module('realtalkApp'));

  var SignoutCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SignoutCtrl = $controller('SignupCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
