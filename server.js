'use strict'

var app = require('./app')
var cluster = require('cluster')
var dotenv = require('dotenv')
var os = require('os')
var pkg = require('./package.json')

dotenv.config({silent: true})

// WEB_CONCURRENCY set by Heroku config
var WORKERS = process.env.WEB_CONCURRENCY || os.cpus().length

if (cluster.isMaster) {
  // Spawn as many workers as there are CPUs in the system.
  for (var i = 0; i < WORKERS; i++) {
    cluster.fork()
  }

  cluster.on('exit', function (worker, code, signal) {
    console.info('worker', worker.process.pid, 'died :(')
    console.info('spawning a new worker')
    cluster.fork()
  })
} else {
  // setup options
  var options = {
    port: process.env.PORT || process.env.npm_package_config_port || pkg.config.port,
    redis: process.env.REDIS || process.env.npm_package_config_redis || pkg.config.redis,
    quiet: process.env.QUIET || process.env.npm_package_config_quiet || pkg.config.quiet
  }

  app(options, function () {
    console.info('spawning worker #' + cluster.worker.id)
  })
}
