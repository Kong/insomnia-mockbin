'use strict'

module.exports = function (req, res, next) {
  res.view = 'default'
  res.yamlInline = 6

  res.body = req.har

  next()
}
