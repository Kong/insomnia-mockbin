'use strict'

import { debuglog } from 'util'
const debug = debuglog('mockbin')

export default function (req, res, next) {
  this.client.get('bin:' + req.params.uuid, function (err, value) {
    if (err) {
      debug(err)

      throw err
    }

    if (value) {
      const har = JSON.parse(value)

      res.view = 'bin/view'
      res.body = har
    }

    next()
  })
}
