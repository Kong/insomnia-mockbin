'use strict'

import app from './src/index.js'
import { config } from 'dotenv'

config({ silent: true })

var options = {
  port: process.env.MOCKBIN_PORT,
  quiet: process.env.MOCKBIN_QUIET,
  redis: process.env.MOCKBIN_REDIS
}

app(options, function () {
  console.info('starting server on port: %d', options.port)
})
