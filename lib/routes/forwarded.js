'use strict'

module.exports = function (req, res, next) {
  res.body = req.forwarded

  next()
}
