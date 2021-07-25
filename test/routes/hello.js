/* global describe, it */

'use strict'

const hello = require('../../lib/routes/hello')

require('should')

describe('/', function () {
  it('should respond with Hello World', function (done) {
    const res = {}

    hello(null, res, function () {
      res.body.should.equal('Hello World!')

      done()
    })
  })
})
