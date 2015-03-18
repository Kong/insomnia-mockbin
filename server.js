'use strict'

var compression = require('compression')
var cookieParser = require('cookie-parser')
var debug = require('debug')('mockbin')
var express = require('express')
var mockbin = require('./src')
var methodOverride = require('method-override')
var morgan = require('morgan')
var rc = require('rc')

// default configs
var config = rc('mockbin', {
  port: process.env.npm_package_config_port,
  redis: process.env.npm_package_config_redis,
  quiet: process.env.npm_package_config_quiet === 'false' ? false : true
})

debug('system started with config %j', config)

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
app.use('/', mockbin(config))

if (!config.quiet) {
  app.use(morgan('dev'))
}

app.listen(config.port)
