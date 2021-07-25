'use strict'

const compression = require('compression')
const cookieParser = require('cookie-parser')
const debug = require('debug-log')('mockbin')
const express = require('express')
const methodOverride = require('method-override')
const morgan = require('morgan')
const path = require('path')
const router = require('../lib')

module.exports = function (options, done) {
  if (!options) {
    throw Error('missing options')
  }

  debug('system started with options: %j', options)

  // setup ExpressJS
  let app = express()

  app.enable('view cache')
  app.enable('trust proxy')
  app.set('view engine', 'pug')
  app.set('views', path.join(__dirname, 'views'))
  app.set('jsonp callback name', '__callback')

  // add 3rd party middlewares
  app.use(compression())
  app.use(cookieParser())
  app.use(methodOverride('__method'))
  app.use(methodOverride('X-HTTP-Method-Override'))
  app.use('/static', express.static(path.join(__dirname, 'static')))

  if (options.quiet !== true) {
    app.use(morgan('dev'))
  }

  // magic starts here
  app.use('/', router(options))

  app.listen(options.port)

  if (typeof done === 'function') {
    done()
  }
}
