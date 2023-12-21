'use strict'

import debugLog from 'debug-log'
const debug = debugLog('mockbin')

export default function (err, req, res, next) {
  debug(err)

  res.status(err.status || 500).view = 'error'

  next()
}
