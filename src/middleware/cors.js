'use strict'

module.exports = function (req, res, next) {
  // default values
  var cors = {
    origin: '*',
    headers: Object.keys(req.headers).join(),
    methods: req.method
  }

  if (req.headers.origin) {
    cors.origin = req.headers.origin
  }

  if (req.headers['access-control-request-headers']) {
    cors.headers = req.headers['access-control-request-headers']
  }

  if (req.headers['access-control-request-method']) {
    cors.methods = req.headers['access-control-request-method']
  }

  res.set({
    'Access-Control-Allow-Origin': cors.origin,
    'Access-Control-Allow-Methods': cors.methods,
    'Access-Control-Allow-Headers': cors.headers,
    'Access-Control-Allow-Credentials': 'true'
  })

  next()
}
