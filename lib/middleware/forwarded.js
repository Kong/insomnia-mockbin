'use strict'

import forwarded from 'forwarded-http/lib/middleware'

export default forwarded({ allowPrivate: true })
