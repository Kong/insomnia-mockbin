'use strict'

module.exports = function gzip (req, res, next) {
  // force compression
  req.headers['accept-encoding'] = 'gzip'

  next()
}
