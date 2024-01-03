'use strict'

var debug = require('debug-log')('mockbin')
var express = require('express')
var mw = require('./middleware')
var routes = require('./routes')

module.exports = function router (options) {
  var router = express.Router()

  var defaults = [mw.forwarded, mw.errorHandler, mw.bodyParser, null, mw.cors, mw.poweredBy, mw.negotiateContent]

  var endpoints = [
    { action: 'get', path: '/', route: routes.hello },
    { action: 'all', path: '/ip', route: routes.ips.one },
    { action: 'all', path: '/ips', route: routes.ips.all },
    { action: 'all', path: '/agent', route: routes.headers.agent },
    { action: 'all', path: '/status/:code/:reason?', route: routes.status },
    { action: 'all', path: '/headers', route: routes.headers.all },
    { action: 'all', path: '/header/:name', route: routes.headers.one },
    { action: 'all', path: '/header/:name/:value', route: routes.headers.set },
    { action: 'all', path: '/cookies', route: routes.cookies.all },
    { action: 'all', path: '/forwarded', route: routes.forwarded },
    { action: 'all', path: '/cookie/:name', route: routes.cookies.one },
    { action: 'all', path: '/cookie/:name/:value', route: routes.cookies.set },
    { action: 'all', path: '/redirect/:status_code/:count?', route: routes.redirect },
    { action: 'all', path: '/delay/:ms?', route: routes.delay },
    { action: 'all', path: '/stream/:chunks?', route: routes.stream },
    { action: 'all', path: '/har*', route: routes.har },
    { action: 'all', path: '/echo*', route: routes.echo },
    { action: 'all', path: '/request*', route: routes.request }
  ]

  endpoints.forEach(function (endpoint) {
    // add route to middleware
    defaults.splice(3, 1, endpoint.route)

    // assign router to action at path
    router[endpoint.action].apply(router, [endpoint.path].concat(defaults))
  })

  if (options && options.redis) {
    router.use('/bin', routes.bins(options.redis))
  } else {
    debug('no redis dsn provided, will not load bin routes')
  }

  // duplicate routes with gzip forced
  router.use('/gzip', routes.gzip, mw.compression, Object.assign(router))

  return router
}
