/* global describe, it */

'use strict'

var ips = require('../../lib/routes/ips')

require('should')

describe('/ip', function () {
  it('should response with ip address', function (done) {
    var res = {}
    var req = {
      ip: '0.0.0.0'
    }

    ips.one(req, res, function () {
      res.body.should.equal(req.ip)

      done()
    })
  })
})

describe('/ips', function () {
  it('should response with all address', function (done) {
    var res = {}
    var req = {
      forwarded: {
        for: {
          '0.0.0.0': -1,
          '1.1.1.1': -1
        }
      }
    }

    ips.all(req, res, function () {
      res.body.should.equal(req.forwarded.for)

      done()
    })
  })
})
