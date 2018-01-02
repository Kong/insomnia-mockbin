'use strict'

var debug = require('debug-log')('mockbin')

module.exports = function (req, res, next) {
  this.client.del(['bin:' + req.params.uuid, 'log:' + req.params.uuid], function (err, value) {
    if (err) {
      debug(err)

      throw err
    }

    if (value < 1) {
      err = 'Unable to delete the Entry, ' + req.params.uuid
      debug(err)

      throw err
    }

    if (req.query.hasOwnProperty('redir')) {
      var location = req.header('Referer')

      res.view = 'redirect'
      res.status(201).location(location).body = value
    } else {
      res.type(req.headers['content-type'] || 'text/plain')
      res.send(value)
    }

    next()
  })
}
