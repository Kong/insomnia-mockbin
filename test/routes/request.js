/* global describe, it */

'use strict'

var request = require('../../lib/routes/request')

require('should')

describe('/request', function () {
  // not much to test here, actual endpoint logic is tested elsewhere
  it('should return object', function (done) {
    var res = {}
    var req = {
      simple: 'foo'
    }

    request(req, res, function () {
      res.body.should.equal(req.simple)

      done()
    })
  })
})
