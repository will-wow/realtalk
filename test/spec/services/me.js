'use strict';

describe('Service: me', function () {

  // load the service's module
  beforeEach(module('realtalkApp'));

  // instantiate service
  var me;
  beforeEach(inject(function (_me_) {
    me = _me_;
  }));

  it('should do something', function () {
    expect(!!me).toBe(true);
  });

});
