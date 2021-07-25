'use strict'

import { debuglog } from 'util'
import { version as _version } from '../../../package.json'
const debug = debuglog('mockbin')

export default function (req, res, next) {
  res.view = 'bin/log'

  this.client.lrange('log:' + req.params.uuid, 0, -1, function (err, history) {
    if (err) {
      debug(err)

      throw err
    }

    res.body = {
      log: {
        version: '1.2',
        creator: {
          name: 'mockbin.com',
          version: _version
        },
        entries: []
      }
    }

    if (history.length) {
      res.body.log.entries = history.map(function (request) {
        return JSON.parse(request)
      })
    }

    next()
  })
}
