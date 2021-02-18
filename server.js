'use strict'

var app = require('./src')
var dotenv = require('dotenv')
var pkg = require('./package')

dotenv.config({ silent: true })
try {
    app(options, function () {
  console.info('starting server on port: %d', options.port)
})

  }
  catch(err) {
    message.innerHTML = "Input " + err;
  }
}
try {
   var options = {
  port: process.env.MOCKBIN_PORT || pkg.config.port,
  quiet: process.env.MOCKBIN_QUIET || pkg.config.quiet,
  redis: process.env.MOCKBIN_REDIS || pkg.config.redis
}

  }
  catch(err) {
    message.innerHTML = "Input " + err;
  }
}

