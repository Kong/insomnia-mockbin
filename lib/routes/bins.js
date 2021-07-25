'use strict'

import { debuglog } from 'util'
import { Router } from 'express'
import { forwarded, errorHandler, bodyParser, cors, negotiateContent } from '../middleware'
import { createClient } from 'redis'
import { form, create, view, sample, log, run } from './bins/'
import { URL } from 'url'
const debug = debuglog('mockbin')

export default function bins (dsnStr) {
  // parse redis dsn
  const dsn = new URL(dsnStr)

  // connect to redis
  this.client = createClient(dsn.port, dsn.hostname, {
    auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
  })

  this.client.on('error', function (err) {
    debug('redis error:', err)
  })

  const router = Router()

  const defaults = [forwarded, errorHandler, bodyParser, null, cors, negotiateContent]

  const endpoints = [
    { action: 'get', path: '/create', route: form.bind(this) },
    { action: 'post', path: '/create', route: create.bind(this) },
    { action: 'get', path: '/:uuid/view', route: view.bind(this) },
    { action: 'get', path: '/:uuid/sample', route: sample.bind(this) },
    { action: 'get', path: '/:uuid/log', route: log.bind(this) },
    { action: 'all', path: '/:uuid*', route: run.bind(this) }
  ]

  endpoints.forEach(function (endpoint) {
    // add route to middleware
    defaults.splice(3, 1, endpoint.route)

    // assign router to action at path
    router[endpoint.action].apply(router, [endpoint.path].concat(defaults))
  })

  return router
}
