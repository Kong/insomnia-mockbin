'use strict'

import debugLog from 'debug-log'
var debug = debugLog('mockbin')
import client from '../../dbconfig.js'

export default function (req, res, next) {
  client.get('bin:' + req.params.uuid, function (err, value) {
    if (err) {
      debug(err)

      throw err
    }

    if (value) {
      var har = JSON.parse(value)

      res.view = 'bin/view'
      res.body = har
    }

    next()
  })
}
