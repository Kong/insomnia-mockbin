'use strict'

import debugLog from 'debug-log'
import client from '../../dbconfig.js'
const debug = debugLog('mockbin')

export default function (req, res, next) {
  client.del('bin:' + req.params.uuid, function (err) {
    if (err) {
      debug(err)

      throw err
    }
    next()
  })

  client.del('log:' + req.params.uuid, function (err) {
    if (err) {
      debug(err)

      throw err
    }
    next()
  })
}
