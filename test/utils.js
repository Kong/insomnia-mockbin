/* global describe, it */

'use strict'

var utils = require('../src/utils')

require('should')

var fixture = {
  method: 'POST',
  url: 'http://mockbin.com/',
  protocol: 'http',
  versionMajor: '1',
  versionMinor: '1',
  headers: {
    foo: 'bar'
  }
}

describe('Utils', function () {
  it('should return blank array on undefined', function (done) {
    var result = utils.objectToArray(undefined)

    result.should.be.an.Array
    result.length.should.be.equal(0)

    done()
  })

  it('should return blank array on invalid type', function (done) {
    var result = utils.objectToArray('foo')

    result.should.be.an.Array
    result.length.should.be.equal(0)

    done()
  })

  it('should convert to name/value pair', function (done) {
    var result = utils.objectToArray(fixture.headers)

    result.should.be.an.Array
    result.should.be.eql([{
      name: 'foo',
      value: 'bar'
    }])

    done()
  })

  it('should calculate header size', function (done) {
    var result = utils.getReqHeaderSize(fixture)

    result.should.be.a.Number
    result.should.be.equal(47)

    done()
  })

  it('should parse "cf-visitor" header to get protocol', function (done) {
    fixture.headers['cf-visitor'] = '{"scheme":"https"}'

    var result = utils.getProtocol(fixture)

    result.should.be.a.String
    result.should.be.equal('https')

    done()
  })

  it('should default to req.protocol when parsing "cf-visitor" header returns nothing', function (done) {
    fixture.headers['cf-visitor'] = '{}'

    var result = utils.getProtocol(fixture)

    result.should.be.a.String
    result.should.be.equal('http')

    done()
  })

  it('should default to req.protocol when parsing "cf-visitor" header fails', function (done) {
    fixture.headers['cf-visitor'] = null

    var result = utils.getProtocol(fixture)

    result.should.be.a.String
    result.should.be.equal('http')

    done()
  })

  it('should parse "x-forwarded-proto" header to get protocol', function (done) {
    fixture.headers['x-forwarded-proto'] = 'https'

    var result = utils.getProtocol(fixture)

    result.should.be.a.String
    result.should.be.equal('https')

    done()
  })

  it('should parse "front-end-https" header to get protocol', function (done) {
    fixture.headers['front-end-https'] = 'on'

    var result = utils.getProtocol(fixture)

    result.should.be.a.String
    result.should.be.equal('https')

    done()
  })
})
