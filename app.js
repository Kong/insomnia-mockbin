'use strict'

var compression = require('compression')
var cookieParser = require('cookie-parser')
var debug = require('debug')('mockbin')
var express = require('express')
var router = require('./src')
var methodOverride = require('method-override')
var morgan = require('morgan')

module.exports = function (options, callback) {
  debug('system started with options: %j', options)

  // express setup
  var app = express()

  app.enable('view cache')
  app.enable('trust proxy')
  app.set('view engine', 'jade')
  app.set('views', __dirname + '/src/views')
  app.set('jsonp callback name', '__callback')

  // add 3rd party middlewares
  app.use(compression())
  app.use(cookieParser())
  app.use(methodOverride('_method'))
  app.use(methodOverride('X-HTTP-Method-Override'))
  app.use('/static', express.static(__dirname + '/src/static'))

  // magic starts here
  app.use('/', router(options))

  if (options.quiet !== true) {
    app.use(morgan('dev'))
  }

  app.listen(options.port)

  if (typeof callback === 'function') {
    callback()
  }
}
