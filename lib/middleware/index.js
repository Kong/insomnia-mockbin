'use strict'

import { camelCase } from 'change-case'

export default require('require-directory')(module, {
  rename: function (name) {
    return camelCase(name)
  }
})
