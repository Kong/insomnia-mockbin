'use strict'

var compression = require('compression')

module.exports = compression({
  threshold: 1,
  filter: function () {
    return true
  }
})
