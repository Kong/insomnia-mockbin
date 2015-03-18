'use strict'

module.exports = function (req, res, next) {
  res.view = 404

  res.status(404).body = {
    error: {
      code: '404',
      message: 'Not Found'
    }
  }

  next()
}
