'use strict';

var HTTPConsole = require('../src');
var unirest = require('unirest');

var should = require('should');

describe('Simple Endpoints', function () {
  var app = HTTPConsole({
    port: 3000,
    quiet: true
  });

  app.createServer().start();

  it('bucket tests', function (done) {
    done();
  });
});
