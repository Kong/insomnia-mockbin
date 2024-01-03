'use strict'

var compression = require('compression')
var cookieParser = require('cookie-parser')
var debug = require('debug-log')('mockbin')
var express = require('express')
var methodOverride = require('method-override')
var morgan = require('morgan')
var path = require('path')
var router = require('../lib')

module.exports = function (options, done) {
  if (!options) {
    throw Error('missing options')
  }

  debug('system started with options: %j', options)

  // setup ExpressJS
  var app = express()

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
