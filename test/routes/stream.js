/* global describe, it */

'use strict'

var stream = require('../../lib/routes/stream')

require('should')

describe('/stream/:chunks', function () {
  it('should respond with streamed chunks using default values', function (done) {
    var req = {
      params: {}
    }

    var res = {
      body: '',

      set: function (headers) {
        res.headers = headers
      },

      write: function (body) {
        res.body += body
      },

      end: function () {
        res.headers.should.have.property('Content-Type').and.equal('text/plain; charset=utf-8')
        res.headers.should.have.property('Transfer-Encoding').and.equal('chunked')

        res.body.should.equal([
          '{"type":"stream","chunk":1}',
          '{"type":"stream","chunk":2}',
          '{"type":"stream","chunk":3}',
          '{"type":"stream","chunk":4}',
          '{"type":"stream","chunk":5}',
          '{"type":"stream","chunk":6}',
          '{"type":"stream","chunk":7}',
          '{"type":"stream","chunk":8}',
          '{"type":"stream","chunk":9}',
          '{"type":"stream","chunk":10}'
        ].join('\n') + '\n')

        done()
      }
    }

    stream(req, res)
  })

  it('should respond with streamed chunks using specified chunks count', function (done) {
    var req = {
      params: {
        chunks: 3
      }
    }

    var res = {
      body: '',

      set: function (headers) {
        res.headers = headers
      },

      write: function (body) {
        res.body += body
      },

      end: function () {
        res.headers.should.have.property('Content-Type').and.equal('text/plain; charset=utf-8')
        res.headers.should.have.property('Transfer-Encoding').and.equal('chunked')

        res.body.should.equal([
          '{"type":"stream","chunk":1}',
          '{"type":"stream","chunk":2}',
          '{"type":"stream","chunk":3}'
        ].join('\n') + '\n')

        done()
      }
    }

    stream(req, res)
  })
})
