'use strict'

const util = require('util')
const debug = util.debuglog('mockbin')

module.exports = function (req, res, next) {
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
