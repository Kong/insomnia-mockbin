/* global describe, it */

'use strict'

const ips = require('../../lib/routes/ips')

require('should')

describe('/ip', function () {
  it('should response with ip address', function (done) {
    const res = {}
    const req = {
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
    const res = {}
    const req = {
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
