'use strict';

describe('Service: Isloggedin', function () {

  // load the service's module
  beforeEach(module('realtalkApp'));

  // instantiate service
  var Isloggedin;
  beforeEach(inject(function (_Isloggedin_) {
    Isloggedin = _Isloggedin_;
  }));

  it('should do something', function () {
    expect(!!Isloggedin).toBe(true);
  });

});
