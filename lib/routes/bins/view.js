'use strict'

const debug = require('debug-log')('mockbin')

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
