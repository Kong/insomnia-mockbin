/* global describe, it */

'use strict'

var echo = require('../../lib/routes/echo')

require('should')

var res = {
  headers: {},

  type: function (type) {
    res.headers['content-type'] = type
  },

  send: function (body) {
    res.body = body
  }
}

describe('/echo', function () {
  it('should respond with request body and content-type header', function (done) {
    var req = {
      body: 'foo',
      headers: {
        'content-type': 'text/plain'
      }
    }

    echo(req, res)

    res.body.should.equal(req.body)
    res.headers.should.have.property('content-type')
    res.headers['content-type'].should.equal(req.headers['content-type'])

    done()
  })

  it('should respond with default values', function (done) {
    var req = {
      headers: {}
    }

    echo(req, res)

    res.body.should.equal('')
    res.headers.should.have.property('content-type')
    res.headers['content-type'].should.equal('text/plain')

    done()
  })
})
