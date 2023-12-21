'use strict'

export default function gzip(req, res, next) {
  // force compression
  req.headers['accept-encoding'] = 'gzip'

  next()
}
