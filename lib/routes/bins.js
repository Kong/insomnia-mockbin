'use strict'

const debug = require('debug-log')('mockbin')
const express = require('express')
const mw = require('../middleware')
const redis = require('redis')
const routes = require('./bins/')
const URL = require('url').URL

module.exports = function bins (dsnStr) {
  // parse redis dsn
  const dsn = new URL(dsnStr)

  // connect to redis
  this.client = redis.createClient(dsn.port, dsn.hostname, {
    auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
  })

  this.client.on('error', function (err) {
    debug('redis error:', err)
  })

  const router = express.Router()

  const defaults = [mw.forwarded, mw.errorHandler, mw.bodyParser, null, mw.cors, mw.negotiateContent]

  const endpoints = [
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
