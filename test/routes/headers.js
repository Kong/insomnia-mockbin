/* global describe, it */

'use strict'

const headers = require('../../lib/routes/headers')

require('should')

describe('/agent', function () {
  it('should response with user-agent header', function (done) {
    const res = {}
    const req = {
      params: {},
      headers: {
        'user-agent': 'foo'
      }
    }

    headers.agent(req, res, function () {
      res.body.should.equal(req.headers['user-agent'])

      done()
    })
  })
})

describe('/header/:name', function () {
  it('should response with one header', function (done) {
    const res = {}
    const req = {
      params: {
        name: 'foo'
      },
      headers: {
        foo: 'bar'
      }
    }

    headers.one(req, res, function () {
      res.body.should.equal(req.headers.foo)

      done()
    })
  })

  it('should response with false when no headers are defined', function (done) {
    const res = {}
    const req = {
      params: {
        name: 'foo'
      },
      headers: {}
    }

    headers.one(req, res, function () {
      res.body.should.be.false()

      done()
    })
  })

  it('should response with false when no match', function (done) {
    const res = {}
    const req = {
      params: {
        name: 'foo'
      }
    }

    headers.one(req, res, function () {
      res.body.should.be.false()

      done()
    })
  })
})

describe('/header/:name', function () {
  it('should response with all headers', function (done) {
    const res = {}
    const req = {
      har: {
        log: {
          entries: [
            {
              request: {
                headers: ['test'],
                headersSize: 0
              }
            }
          ]
        }
      }
    }

    headers.all(req, res, function () {
      res.body.should.eql(req.har.log.entries[0].request)

      done()
    })
  })
})
