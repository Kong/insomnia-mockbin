'use strict'

module.exports = function (req, res, next) {
  res.view = 'index'

  res.body = 'Hello World!'

  next()
}
