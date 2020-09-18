'use strict'

var debug = require('debug-log')('mockbin')
var express = require('express')
var mw = require('../middleware')
var redis = require('redis')
var routes = require('./bins/')
var URL = require('url').URL

module.exports = function bins (dsnStr) {
  // parse redis dsn
  var dsn = new URL(dsnStr)

  // connect to redis
  this.client = redis.createClient(dsn.port, dsn.hostname, {
    auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
  })

  this.client.on('error', function (err) {
    debug('redis error:', err)
  })

  var router = express.Router()

  var defaults = [mw.forwarded, mw.errorHandler, mw.bodyParser, null, mw.cors, mw.negotiateContent]

  var endpoints = [
    { action: 'get', path: '/create', route: routes.form.bind(this) },
    { action: 'post', path: '/create', route: routes.create.bind(this) },
    { action: 'get', path: '/:uuid/view', route: routes.view.bind(this) },
    { action: 'get', path: '/:uuid/sample', route: routes.sample.bind(this) },
    { action: 'get', path: '/:uuid/log', route: routes.log.bind(this) },
    { action: 'all', path: '/:uuid*', route: routes.run.bind(this) }
  ]

  endpoints.forEach(function (endpoint) {
    // add route to middleware
    defaults.splice(3, 1, endpoint.route)

    // assign router to action at path
    router[endpoint.action].apply(router, [endpoint.path].concat(defaults))
  })

  return router
}
