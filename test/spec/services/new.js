'use strict';

describe('Service: new', function () {

  // load the service's module
  beforeEach(module('realtalkApp'));

  // instantiate service
  var new;
  beforeEach(inject(function (_new_) {
    new = _new_;
  }));

  it('should do something', function () {
    expect(!!new).toBe(true);
  });

});
