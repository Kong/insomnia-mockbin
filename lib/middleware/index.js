'use strict'

var changeCase = require('change-case')

module.exports = require('require-directory')(module, {
  rename: function (name) {
    return changeCase.camelCase(name)
  }
})
