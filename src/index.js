'use strict'

var debug = require('debug')('mockbin')
var express = require('express')
var mw = require('./middleware')
var routes = require('./routes')
var util = require('util')
var compression = require('compression')

module.exports = function (config) {
  var router = express.Router()

  router.get('/', mw.errorHandler, mw.bodyParser, routes.hello, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/ip', mw.errorHandler, mw.bodyParser, routes.ips.one, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/ips', mw.errorHandler, mw.bodyParser, routes.ips.all, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/agent', mw.errorHandler, mw.bodyParser, routes.headers.agent, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/status/:code/:reason?', mw.errorHandler, mw.bodyParser, routes.status, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/headers', mw.errorHandler, mw.bodyParser, routes.headers.all, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/header/:name', mw.errorHandler, mw.bodyParser, routes.headers.one, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/cookies', mw.errorHandler, mw.bodyParser, routes.cookies.all, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/cookie/:name', mw.errorHandler, mw.bodyParser, routes.cookies.one, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/redirect/:status_code/:count?', mw.errorHandler, mw.bodyParser, routes.redirect, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/delay/:ms?', mw.errorHandler, mw.bodyParser, routes.delay, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/stream/:chunks?', mw.errorHandler, mw.bodyParser, routes.stream, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/har*', mw.errorHandler, mw.bodyParser, routes.har, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/echo*', mw.errorHandler, mw.bodyParser, routes.echo, mw.cors, mw.poweredBy, mw.negotiateContent)

  router.all('/request*', mw.errorHandler, mw.bodyParser, routes.request, mw.cors, mw.poweredBy, mw.negotiateContent)

  if (config && config.redis) {
    router.use('/bin', routes.bins(config.redis))
  } else {
    debug('no redis dsn provided, will not load bin routes')
  }

  var opts = {
    threshold: 1,
    filter: function () {
      return true
    }
  }

  // duplicate routes with gzip forced
  router.use('/gzip', routes.gzip, compression(opts), util._extend(router))

  return router
}
