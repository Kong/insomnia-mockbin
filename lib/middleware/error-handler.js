'use strict'

import { debuglog } from 'util'
const debug = debuglog('mockbin')

export default function (err, req, res, next) {
  debug(err)

  res.status(err.status || 500).view = 'error'

  next()
}
