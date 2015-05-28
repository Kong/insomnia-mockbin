'use strict'

var app = require('./src')
var cluster = require('cluster')
var dotenv = require('dotenv')
var os = require('os')
var util = require('util')

dotenv.config({silent: true})

var defaults = {
  port: process.env.PORT || process.env.npm_package_config_port,
  quiet: process.env.QUIET || process.env.npm_package_config_quiet,
  redis: process.env.REDIS || process.env.npm_package_config_redis,
  // WEB_CONCURRENCY set by Heroku config
  workers: process.env.WEB_CONCURRENCY || process.env.WORKERS || process.env.npm_package_config_workers || os.cpus().length
}

module.exports = function (options) {
  var opts = util._extend(defaults, options)

  if (cluster.isMaster) {
    console.info('starting server on port: %d', opts.port)

    for (var i = 0; i < opts.workers; i++) {
      cluster.fork()
    }

    // catch errors
    cluster.on('exit', function (worker, code, signal) {
      console.info('worker %s died :(', worker.process.pid)
      cluster.fork()
    })
  } else {
    app(opts, function () {
      console.info('spawning worker # %s', cluster.worker.id)
    })
  }
}
