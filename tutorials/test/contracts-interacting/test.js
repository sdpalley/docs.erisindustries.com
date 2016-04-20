'use strict';

var
  assert = require('assert'),
  child_process = require('child_process'),
  fs = require('fs'),
  idisContract = require('./app.js'),
  untildify= require('untildify');

it("should get and set a value", function (done) {
  idisContract.get(function (error, value) {
    assert.ifError(error);
    assert.equal(value, 5);

    idisContract.set(150, function (error) {
      assert.ifError(error);

      idisContract.get(function (error, value) {
        assert.ifError(error);
        assert.equal(value, 150);
        done();
      });
    });
  });
});
