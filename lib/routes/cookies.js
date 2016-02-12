'use strict'

module.exports = {
  one: function oneCookie (req, res, next) {
    var name = req.params.name.toLowerCase()

    res.body = req.cookies ? (req.cookies[name] ? req.cookies[name] : false) : false

    next()
  },

  set: function setCookie (req, res, next) {
    res.cookie(req.params.name, req.params.value)

    res.body = req.params.value

    next()
  },

  all: function allCookies (req, res, next) {
    res.body = req.har.log.entries[0].request.cookies

    next()
  }
}
