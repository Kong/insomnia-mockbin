/* global describe, it, before, after */

'use strict'

var cookieParser = require('cookie-parser')
var express = require('express')
var mockbin = require('../../lib')
var path = require('path')
var unirest = require('unirest')

var app = express()
var server = null

require('should')

describe('HTTP', function () {
  before(function (done) {
    // express setup
    app.enable('trust proxy')
    app.set('view engine', 'pug')
    app.set('views', path.join(__dirname, '..', '..', 'src', 'views'))

    app.use(cookieParser())

    app.use('/', mockbin())
    server = app.listen(3000, function () { done() })
  })

  after(function () {
    server.close()
  })

  it('home page responds with html content', function (done) {
    var req = unirest.get('http://localhost:3000/')

    req.headers('Accept', 'text/html')

    req.end(function (res) {
      res.status.should.equal(200)
      res.headers.should.have.property('content-type').and.equal('text/html; charset=utf-8')
      done()
    })
  })

  it('should send CORS headers', function (done) {
    var req = unirest.options('http://localhost:3000/request')

    req.end(function (res) {
      res.headers.should.have.property('access-control-allow-origin').and.equal('*')
      res.headers.should.have.property('access-control-allow-methods').and.equal('OPTIONS')
      res.headers.should.have.property('access-control-allow-headers').and.equal('host,content-length,connection')
      done()
    })
  })

  it('GET / responds with hello message', function (done) {
    var req = unirest.get('http://localhost:3000/')

    req.headers('Accept', 'text/plain')

    req.end(function (res) {
      res.headers.should.have.property('content-type').and.equal('text/plain; charset=utf-8')
      res.body.should.equal('Hello World!')
      done()
    })
  })

  it('GET /ip should return local ip', function (done) {
    var req = unirest.get('http://localhost:3000/ip')

    req.headers('Accept', 'text/plain')

    req.end(function (res) {
      res.body.should.match(/127\.0\.0\.1/)
      done()
    })
  })

  it('GET /ips should return proxied IPs', function (done) {
    var req = unirest.get('http://localhost:3000/ips')

    req.headers({
      Accept: 'application/json',
      'X-Forwarded-For': '10.10.10.1, 10.10.10.2, 10.10.10.3'
    })

    req.end(function (res) {
      res.body.should.be.an.Object()
      res.body.should.have.properties('10.10.10.1', '10.10.10.2', '10.10.10.3')

      done()
    })
  })

  it('GET /agent should return user-agent string', function (done) {
    var req = unirest.get('http://localhost:3000/agent')

    req.headers({
      Accept: 'text/plain',
      'User-Agent': 'mockbin tester'
    })

    req.end(function (res) {
      res.body.should.equal('mockbin tester')

      done()
    })
  })

  it('GET /status/:code should return custom status code', function (done) {
    var req = unirest.get('http://localhost:3000/status/900')

    req.headers('Accept', 'application/json')

    req.end(function (res) {
      res.status.should.equal(900)
      res.body.should.have.property('code').and.equal('900')
      res.body.should.have.property('message').and.equal('OK')
      done()
    })
  })

  it('GET /status/:code/:reason should return custom status code + reason', function (done) {
    var req = unirest.get('http://localhost:3000/status/900/reason')

    req.headers('Accept', 'application/json')

    req.end(function (res) {
      res.status.should.equal(900)
      res.body.should.have.property('code').and.equal('900')
      res.body.should.have.property('message').and.equal('reason')
      done()
    })
  })

  it('GET /status/:code/:reason should allow spaces in reason text', function (done) {
    var req = unirest.get('http://localhost:3000/status/900/because of reasons')

    req.headers('Accept', 'application/json')

    req.end(function (res) {
      res.status.should.equal(900)
      res.body.should.have.property('code').and.equal('900')
      res.body.should.have.property('message').and.equal('because of reasons')
      done()
    })
  })

  it('GET /status/:code/:reason should replace plus signs in reason text with spaces', function (done) {
    var req = unirest.get('http://localhost:3000/status/900/because+of+reasons')

    req.headers('Accept', 'application/json')

    req.end(function (res) {
      res.status.should.equal(900)
      res.body.should.have.property('code').and.equal('900')
      res.body.should.have.property('message').and.equal('because of reasons')
      done()
    })
  })

  it('GET /headers should return all headers', function (done) {
    var req = unirest.get('http://localhost:3000/headers')

    req.headers({
      Accept: 'application/json',
      'X-Custom-Header': 'ALL YOUR BASE ARE BELONG TO US'
    })

    req.end(function (res) {
      res.body.headers.should.containEql({ name: 'x-custom-header', value: 'ALL YOUR BASE ARE BELONG TO US' })

      done()
    })
  })

  it('GET /header/:name should return specific headers', function (done) {
    var req = unirest.get('http://localhost:3000/header/X-Custom-Header')

    req.headers({
      Accept: 'application/json',
      'X-Custom-Header': 'ALL YOUR BASE ARE BELONG TO US'
    })

    req.end(function (res) {
      res.body.should.equal('ALL YOUR BASE ARE BELONG TO US')

      done()
    })
  })

  it('GET /cookies should return all cookies', function (done) {
    var req = unirest.get('http://localhost:3000/cookies')

    req.headers({
      Accept: 'application/json',
      Cookie: 'my-cookie=ALL YOUR BASE ARE BELONG TO US'
    })

    req.end(function (res) {
      res.body.should.containEql({ name: 'my-cookie', value: 'ALL YOUR BASE ARE BELONG TO US' })

      done()
    })
  })

  it('GET /cookie/:name should return specific cookie', function (done) {
    var req = unirest.get('http://localhost:3000/cookie/my-cookie')

    req.headers({
      Accept: 'application/json',
      Cookie: 'my-cookie=ALL YOUR BASE ARE BELONG TO US'
    })

    req.end(function (res) {
      res.body.should.containEql('ALL YOUR BASE ARE BELONG TO US')

      done()
    })
  })

  it('GET /redirect/:status should redirect 1 time using :status', function (done) {
    var req = unirest.get('http://localhost:3000/redirect/303')

    req.followRedirect(true)

    req.maxRedirects(0)

    req.end(function (res) {
      res.error.toString().should.equal('Error: Exceeded maxRedirects. Probably stuck in a redirect loop http://localhost:3000/redirect/303')

      done()
    })
  })

  it('GET /redirect/:status/:n should redirect :n times using :status', function (done) {
    var req = unirest.get('http://localhost:3000/redirect/302/3')

    req.followRedirect(true)

    req.headers('Accept', 'application/json')

    req.end(function (res) {
      res.body.should.equal('redirect finished')

      done()
    })
  })

  it('GET /redirect/:status/:n should redirect :n times using :status (verify count)', function (done) {
    var req = unirest.get('http://localhost:3000/redirect/302/3')

    req.followRedirect(true)

    req.maxRedirects(2)

    req.end(function (res) {
      res.error.toString().should.equal('Error: Exceeded maxRedirects. Probably stuck in a redirect loop http://localhost:3000/redirect/302/1')

      done()
    })
  })

  it('GET /redirect/:status?to=URL should redirect to URL', function (done) {
    var req = unirest.get('http://localhost:3000/redirect/308?to=http://mockbin.com/')

    req.followRedirect(false)

    req.end(function (res) {
      res.status.should.equal(308)
      res.headers.should.containEql({ location: 'http://mockbin.com/' })

      done()
    })
  })
})
