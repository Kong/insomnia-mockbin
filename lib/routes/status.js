'use strict'

module.exports = function status (req, res, next) {
  res.statusCode = req.params.code || 200
  res.statusMessage = (req.params.reason || 'OK').replace(/\+/g, ' ')

  res.body = {
    code: res.statusCode,
    message: res.statusMessage
  }

  next()
}
