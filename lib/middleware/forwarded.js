'use strict'

import forwarded from 'forwarded-http/lib/middleware.js'

export default forwarded({ allowPrivate: true })
