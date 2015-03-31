/* global describe, it */

'use strict'

var har = require('../../src/routes/har')

require('should')

describe('/har', function () {
  // not much to test here, actual endpoint logic is tested elsewhere
  it('should return object', function (done) {
    var res = {}
    var req = {
      har: 'foo'
    }

    har(req, res, function () {
      res.body.should.equal(req.har)

      done()
    })
  })
})
