'use strict'

var compression = require('compression')
var cookieParser = require('cookie-parser')
var debug = require('debug')('mockbin')
var express = require('express')
var mockbin = require('./src')
var methodOverride = require('method-override')
var morgan = require('morgan')

module.exports = function (options, callback) {
  debug('system started with options: %j', options)

  // express setup
  var app = express()

  app.set('jsonp callback name', '__callback')
  app.set('view engine', 'jade')
  app.enable('view cache')
  app.enable('trust proxy')

  // add 3rd party middlewares
  app.use(methodOverride('X-HTTP-Method-Override'))
  app.use(methodOverride('_method'))
  app.use(cookieParser())
  app.use(compression())

  // magic starts here
  app.use('/', mockbin(options))

  if (options.quiet !== true) {
    app.use(morgan('dev'))
  }

  app.listen(options.port)

  if (typeof callback === 'function') {
    callback()
  }
}
