'use strict'

module.exports = {
  one: function (req, res, next) {
    res.body = req.ip

    next()
  },

  all: function (req, res, next) {
    res.body = req.ips

    next()
  }
}
