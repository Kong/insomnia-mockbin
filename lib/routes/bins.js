'use strict'

import debugLog from 'debug-log'
var debug = debugLog('mockbin')
import { Router } from 'express'
// import { forwarded, errorHandler, bodyParser, cors, negotiateContent } from '../middleware'
import forwarded from '../middleware/forwarded.js'
import errorHandler from '../middleware/error-handler.js'
import bodyParser from '../middleware/body-parser.js'
import cors from '../middleware/cors.js'
import negotiateContent from '../middleware/negotiate-content.js'
import { createClient } from 'redis'
// import { form, create, view, sample, log, delete, update, run } from './bins/'
import form from './bins/form.js'
import create from './bins/create.js'
import view from './bins/view.js'
import sample from './bins/sample.js'
import log from './bins/log.js'
import _delete from './bins/delete.js'
import update from './bins/update.js'
import run from './bins/run.js'
import { URL } from 'url'

export default function bins() {
  // parse redis dsn
  // var dsn = new URL(dsnStr)

  // connect to redis
  // this.client = createClient(dsn.port, dsn.hostname, {
  //   auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
  // })

  // this.client.on('error', function (err) {
  //   debug('redis error:', err)
  // })

  var router = Router()

  var defaults = [forwarded, errorHandler, bodyParser, null, cors, negotiateContent]

  var endpoints = [
    { action: 'get', path: '/create', route: form },
    { action: 'post', path: '/create', route: create },
    { action: 'get', path: '/:uuid/view', route: view },
    { action: 'get', path: '/:uuid/sample', route: sample },
    { action: 'get', path: '/:uuid/log', route: log },
    { action: 'delete', path: '/:uuid/delete', route: _delete },
    { action: 'put', path: '/:uuid', route: update },
    { action: 'all', path: '/:uuid*', route: run }
  ]

  endpoints.forEach(function (endpoint) {
    // add route to middleware
    defaults.splice(3, 1, endpoint.route)

    // assign router to action at path
    router[endpoint.action].apply(router, [endpoint.path].concat(defaults))
  })

  return router
}
