'use strict'

import app from './src/index.js'
import { config } from 'dotenv'
import pkg from './package.json' assert { type: "json" };

config({ silent: true })

var options = {
  port: process.env.MOCKBIN_PORT || pkg.config.port,
  quiet: process.env.MOCKBIN_QUIET || pkg.config.quiet,
  redis: process.env.MOCKBIN_REDIS || pkg.config.redis
}

app(options, function () {
  console.info('starting server on port: %d', options.port)
})
