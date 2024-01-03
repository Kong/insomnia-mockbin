'use strict'

module.exports = function (req, res, next) {
  res.view = 'bin/create'

  next()
}
