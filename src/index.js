'use strict'

var debug = require('debug')('mockbin')
var express = require('express')
var mw = require('./middleware')
var routes = require('./routes')
var util = require('util')
var compression = require('compression')

module.exports = function (config) {
  var router = express.Router()

  router.get('/', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.hello, mw.negotiateContent)

  router.all('/ip', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.ips.one, mw.negotiateContent)

  router.all('/ips', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.ips.all, mw.negotiateContent)

  router.all('/agent', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.headers.agent, mw.negotiateContent)

  router.all('/status/:code/:reason?', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.status, mw.negotiateContent)

  router.all('/headers', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.headers.all, mw.negotiateContent)

  router.all('/header/:name', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.headers.one, mw.negotiateContent)

  router.all('/cookies', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.cookies.all, mw.negotiateContent)

  router.all('/cookie/:name', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.cookies.one, mw.negotiateContent)

  router.all('/redirect/:status_code/:count?', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.redirect, mw.negotiateContent)

  router.all('/delay/:ms?', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.delay, mw.negotiateContent)

  router.all('/stream/:chunks?', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.stream)

  router.all('/har*', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.har, mw.negotiateContent)

  router.all('/echo*', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.echo)

  router.all('/request*', mw.errorHandler, mw.bodyParser, mw.cors, mw.poweredBy, routes.request, mw.negotiateContent)

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
