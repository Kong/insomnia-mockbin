'use strict'

module.exports = {
  one: function (req, res, next) {
    res.status(200).body = req.ip

    next()
  },

  all: function (req, res, next) {
    res.status(200).body = req.ips

    next()
  }
}
