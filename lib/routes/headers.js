'use strict'

module.exports = {
  one: function oneHeader (req, res, next) {
    var name = req.params.name.toLowerCase()

    res.body = req.headers ? (req.headers[name] ? req.headers[name] : false) : false

    next()
  },

  agent: function agent (req, res, next) {
    req.params.name = 'user-agent'

    module.exports.one(req, res, next)
  },

  set: function setHeader (req, res, next) {
    res.set(req.params.name, req.params.value)

    res.body = req.params.value

    next()
  },

  all: function allHeaders (req, res, next) {
    res.yamlInline = 2

    res.body = {
      headers: req.har.log.entries[0].request.headers,
      headersSize: req.har.log.entries[0].request.headersSize
    }

    next()
  }
}
