'use strict'

var forwarded = require('forwarded-http/lib/middleware')

module.exports = forwarded({ allowPrivate: true })
