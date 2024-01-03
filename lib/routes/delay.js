'use strict'

module.exports = function delay (req, res, next) {
  var delay = req.params.ms ? parseInt(req.params.ms, 10) : 200

  if (delay > 60000) {
    delay = 60000
  }

  setTimeout(function () {
    res.body = {
      delay: delay
    }

    next()
  }, delay)
}
