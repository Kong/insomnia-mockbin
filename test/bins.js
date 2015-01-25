'use strict';

var HTTPConsole = require('../lib');
var unirest = require('unirest');

var should = require('should');

describe('Simple Endpoints', function () {
  var app = HTTPConsole({
    port: 3000,
    quiet: true
  });

  app.createServer().start();

  it('bin tests', function (done) {
    done();
  });
});
