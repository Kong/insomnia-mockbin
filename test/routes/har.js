/* global describe, it */

'use strict'

const har = require('../../lib/routes/har')

require('should')

describe('/har', function () {
  // not much to test here, actual endpoint logic is tested elsewhere
  it('should return object', function (done) {
    const res = {}
    const req = {
      har: 'foo'
    }

    har(req, res, function () {
      res.body.should.equal(req.har)

      done()
    })
  })
})
