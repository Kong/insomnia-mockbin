'use strict'

module.exports = function forwarded (req, res, next) {
  res.body = req.forwarded

  next()
}
