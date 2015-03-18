'use strict'

module.exports = function (req, res, next) {
  res.view = 'index'

  res.status(200).body = 'Hello World!'

  next()
}
