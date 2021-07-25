'use strict'

const util = require('util')
const debug = util.debuglog('mockbin')

module.exports = function (err, req, res, next) {
  debug(err)

  res.status(err.status || 500).view = 'error'

  next()
}
