'use strict'

module.exports = {
  one: function (req, res, next) {
    var name = req.params.name.toLowerCase()

    res.body = req.cookies ? (req.cookies[name] ? req.cookies[name] : false) : false

    next()
  },

  all: function (req, res, next) {
    res.body = req.har.log.entries[0].request.cookies

    next()
  }
}
