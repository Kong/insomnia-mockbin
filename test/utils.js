/* global describe, it */

'use strict'

var pkg = require('../package.json')
var utils = require('../lib/utils')

require('should')

var fixture = {
  method: 'POST',
  url: 'http://mockbin.com/',
  protocol: 'http',
  versionMajor: '1',
  versionMinor: '1',
  ip: '127.0.0.1',
  body: '',
  rawBody: '',
  hostname: 'mockbin.com',
  originalUrl: '/',
  forwarded: {
    proto: 'http'
  },
  headers: {
    foo: 'bar'
  }
}

describe('Utils', function () {
  describe('ObjectToArray', function () {
    it('should return blank array on undefined', function (done) {
      var result = utils.objectToArray(undefined)

      result.should.be.an.Array()
      result.length.should.be.equal(0)

      done()
    })

    it('should return blank array on invalid type', function (done) {
      var result = utils.objectToArray('foo')

      result.should.be.an.Array()
      result.length.should.be.equal(0)

      done()
    })

    it('should convert to name/value pair', function (done) {
      var result = utils.objectToArray(fixture.headers)

      result.should.be.an.Array()
      result.should.be.eql([{
        name: 'foo',
        value: 'bar'
      }])

      done()
    })
  })

  describe('getReqHeaderSize', function () {
    it('should calculate header size', function (done) {
      var result = utils.getReqHeaderSize(fixture)

      result.should.be.a.Number()
      result.should.be.equal(47)

      done()
    })
  })

  describe('createHar', function () {
    var result = utils.createHar(fixture)

    result.log.entries[0].startedDateTime = 'now'

    result.should.be.an.Object()
    result.should.eql({
      log: {
        version: '1.2',
        creator: {
          name: 'mockbin.com',
          version: pkg.version
        },

        entries: [{
          startedDateTime: 'now',
          clientIPAddress: '127.0.0.1',
          request: {
            method: 'POST',
            url: 'http://mockbin.com/',
            httpVersion: 'HTTP/1.1',
            cookies: [],
            headers: [
              {
                name: 'foo',
                value: 'bar'
              }
            ],
            queryString: [],
            postData: {
              mimeType: 'application/octet-stream',
              params: [],
              text: ''
            },
            headersSize: 47,
            bodySize: 0
          }
        }]
      }
    })
  })

  describe('createSimpleHar', function () {

  })
})
