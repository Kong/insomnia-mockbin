'use strict'

module.exports = function hello (req, res, next) {
  res.view = 'index'

  res.body = 'Hello World!'

  next()
}
