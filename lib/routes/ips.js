'use strict'

module.exports = {
  one: function oneIP (req, res, next) {
    res.body = req.ip

    next()
  },

  all: function allIPs (req, res, next) {
    res.body = req.forwarded.for

    next()
  }
}
