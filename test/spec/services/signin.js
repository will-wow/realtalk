'use strict';

describe('Service: SignIn', function () {

  // load the service's module
  beforeEach(module('realtalkApp'));

  // instantiate service
  var SignIn;
  beforeEach(inject(function (_SignIn_) {
    SignIn = _SignIn_;
  }));

  it('should do something', function () {
    expect(!!SignIn).toBe(true);
  });

});
