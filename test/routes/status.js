/* global describe, it */

'use strict'

var status = require('../../lib/routes/status')

require('should')

describe('/status/:code/:reason', function () {
  it('should use defaults', function (done) {
    var req = {
      params: {}
    }

    var res = {}

    status(req, res, function () {
      res.statusCode.should.equal(200)
      res.statusMessage.should.equal('OK')

      res.body.code.should.equal(200)
      res.body.message.should.equal('OK')

      done()
    })
  })

  it('should use params', function (done) {
    var req = {
      params: {
        code: 300,
        reason: 'foo'
      }
    }

    var res = {}

    status(req, res, function () {
      res.statusCode.should.equal(300)
      res.statusMessage.should.equal('foo')

      res.body.code.should.equal(300)
      res.body.message.should.equal('foo')
      done()
    })
  })

  it('should replace + with spaces', function (done) {
    var req = {
      params: {
        code: 300,
        reason: 'foo+bar'
      }
    }

    var res = {}

    status(req, res, function () {
      res.statusCode.should.equal(300)
      res.statusMessage.should.equal('foo bar')

      res.body.code.should.equal(300)
      res.body.message.should.equal('foo bar')
      done()
    })
  })
})
