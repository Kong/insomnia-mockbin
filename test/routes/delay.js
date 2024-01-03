/* global describe, it */

'use strict'

var delay = require('../../lib/routes/delay')

require('should')

describe('/delay/:ms', function () {
  this.timeout(210)

  it('should not timeout', function (done) {
    var res = {}
    var req = {
      params: {
        ms: 10
      }
    }

    delay(req, res, function () {
      res.body.should.eql({
        delay: req.params.ms
      })

      done()
    })
  })

  it('should default to 200ms', function (done) {
    var res = {}
    var req = {
      params: {}
    }

    delay(req, res, function () {
      res.body.should.eql({
        delay: 200
      })

      done()
    })
  })
})
