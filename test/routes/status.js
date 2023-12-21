/* global describe, it */

'use strict'

const status = require('../../lib/routes/status')

require('should')

describe('/status/:code/:reason', function () {
  it('should use defaults', function (done) {
    const req = {
      params: {}
    }

    const res = {}

    status(req, res, function () {
      res.statusCode.should.equal(200)
      res.statusMessage.should.equal('OK')

      res.body.code.should.equal(200)
      res.body.message.should.equal('OK')

      done()
    })
  })

  it('should use params', function (done) {
    const req = {
      params: {
        code: 300,
        reason: 'foo'
      }
    }

    const res = {}

    status(req, res, function () {
      res.statusCode.should.equal(300)
      res.statusMessage.should.equal('foo')

      res.body.code.should.equal(300)
      res.body.message.should.equal('foo')
      done()
    })
  })

  it('should replace + with spaces', function (done) {
    const req = {
      params: {
        code: 300,
        reason: 'foo+bar'
      }
    }

    const res = {}

    status(req, res, function () {
      res.statusCode.should.equal(300)
      res.statusMessage.should.equal('foo bar')

      res.body.code.should.equal(300)
      res.body.message.should.equal('foo bar')
      done()
    })
  })
})
