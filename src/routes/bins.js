'use strict'

var debug = require('debug')('mockbin')
var express = require('express')
var mw = require('../middleware')
var pkg = require('../../package.json')
var redis = require('redis')
var url = require('url')
var util = require('util')
var uuid = require('node-uuid')
var validate = require('har-validator')

var Bins = function (dsn_str) {
  if (!(this instanceof Bins)) {
    return new Bins(dsn_str)
  }

  // parse redis dsn
  var dsn = url.parse(dsn_str)

  // connect to redis
  this.client = redis.createClient(dsn.port, dsn.hostname, {
    auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
  })

  this.client.on('error', function (err) {
    debug('redis error:', err)
  })

  var router = express.Router()

  router.get('/create', mw.errorHandler, mw.bodyParser, this.routes.form.bind(this), mw.cors, mw.negotiateContent)

  router.post('/create', mw.errorHandler, mw.bodyParser, this.routes.create.bind(this), mw.cors, mw.negotiateContent)

  router.get('/:uuid/view', mw.errorHandler, mw.bodyParser, this.routes.view.bind(this), mw.cors, mw.negotiateContent)

  router.get('/:uuid/sample', mw.errorHandler, mw.bodyParser, this.routes.sample.bind(this), mw.cors, mw.negotiateContent)

  router.get('/:uuid/log', mw.errorHandler, mw.bodyParser, this.routes.log.bind(this), mw.cors, mw.negotiateContent)

  router.post('/:uuid/log/clear', mw.errorHandler, mw.bodyParser, this.routes.clear_log.bind(this), mw.cors, mw.negotiateContent)

  router.all('/:uuid*', mw.errorHandler, mw.bodyParser, this.routes.send.bind(this), mw.cors, mw.negotiateContent)

  return router
}

Bins.prototype.routes = {
  form: function (req, res, next) {
    res.view = 'bin/create'

    next()
  },

  create: function (req, res, next) {
    var mock = req.jsonBody

    // check for full HAR
    if (req.jsonBody && req.jsonBody.response) {
      mock = req.jsonBody.response
    }

    // overritten by application/x-www-form-urlencoded or multipart/form-data\
    if (req.simple.postData.params && req.simple.postData.params.response) {
      try {
        mock = JSON.parse(req.simple.postData.params.response)
      } catch (e) {
        debug(e)
      }
    }

    // provide optional values before validation
    mock.redirectURL = ''
    mock.bodySize = 0
    mock.headersSize = 0
    mock.content.size = 0

    validate.response(mock, function (err, valid) {
      if (!valid) {
        res.body = {
          errors: err.errors
        }

        return next()
      }

      var id = uuid.v4()

      this.client.set('bin:' + id, JSON.stringify(mock))

      res.view = 'redirect'
      res.status(201).location(util.format('/bin/%s', id)).body = id

      next()
    }.bind(this))
  },

  view: function (req, res, next) {
    this.client.get('bin:' + req.params.uuid, function (err, value) {
      if (err) {
        debug(err)

        throw err
      }

      if (value) {
        var har = JSON.parse(value)

        res.view = 'bin/view'
        res.body = har
      }

      next()
    })
  },

  sample: function (req, res, next) {
    this.client.get('bin:' + req.params.uuid, function (err, value) {
      if (err) {
        debug(err)

        throw err
      }

      if (value) {
        res.json({
          method: 'POST',
          url: util.format('%s://%s/bin/%s', req.protocol, req.hostname, req.params.uuid),
          httpVersion: 'HTTP/1.1',
          queryString: [
            {
              name: 'foo',
              value: 'bar'
            },
            {
              name: 'foo',
              value: 'baz'
            }
          ],
          headers: [
            {
              name: 'Accept',
              value: 'application/json'
            },
            {
              name: 'Content-Type',
              value: 'application/x-www-form-urlencoded'
            }
          ],
          cookies: [
            {
              name: 'foo',
              value: 'bar'
            },
            {
              name: 'bar',
              value: 'baz'
            }
          ],
          postData: {
            mimeType: 'application/x-www-form-urlencoded',
            params: [{
              name: 'foo',
              value: 'bar'
              },
              {
                name: 'bar',
                value: 'baz'
            }]
          }
        })
      }
    })
  },

  send: function (req, res, next) {
    this.client.get('bin:' + req.params.uuid, function (err, value) {
      if (err) {
        debug(err)

        throw err
      }

      if (value) {
        var har = JSON.parse(value)

        // log interaction & send the appropriate response based on HAR
        this.client.rpush('log:' + req.params.uuid, JSON.stringify(req.har.log.entries[0]))
        this.client.ltrim('log:' + req.params.uuid, 0, 100)

        // headers
        har.headers.map(function (header) {
          res.set(header.name, header.value)
        })

        // cookies
        har.cookies.map(function (cookie) {
          res.cookie(cookie.name, cookie.value)
        })

        // status
        res.httpVersion = har.httpVersion.split('/')[1]
        res.statusCode = har.status || 200
        res.statusMessage = har.statusText || 'OK'

        // special condition
        if (har.redirectURL !== '') {
          res.location(har.redirectURL)
        }

        return res.send(har.content.text ? har.content.text : null)
      }

      next()
    }.bind(this))
  },

  log: function (req, res, next) {
    res.view = 'bin/log'

    this.client.lrange('log:' + req.params.uuid, 0, -1, function (err, history) {
      if (err) {
        debug(err)

        throw err
      }

      res.body = {
        log: {
          version: '1.2',
          creator: {
            name: 'mockbin.com',
            version: pkg.version
          },
          entries: []
        }
      }

      if (history.length) {
        res.body.log.entries = history.map(function (request) {
          return JSON.parse(request)
        })
      }

      next()
    })
  },

  clear_log: function (req, res, next) {
    this.client.del('log:' + req.params.uuid, function (err, history) {
      if (err) {
        debug(err)

        throw err
      }

      res.view = 'redirect';
      res.status(200).location(util.format('/bin/%s', req.params.uuid));
      next();
    });
  }
}

module.exports = Bins
