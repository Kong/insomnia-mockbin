'use strict'

var debug = require('debug-log')('mockbin')

module.exports = function (req, res, next) {
  this.client.del('bin:' + req.params.uuid, function (err) {
    if (err) {
      debug(err)

      throw err
    }
    next()
  })

  this.client.del('log:' + req.params.uuid, function (err) {
    if (err) {
      debug(err)

      throw err
    }
    next()
  })
}
