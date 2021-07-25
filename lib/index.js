'use strict'

import { debuglog } from 'util'
import { Router } from 'express'
import { forwarded, errorHandler, bodyParser, cors, poweredBy, negotiateContent, compression } from './middleware'
import { hello, ips, headers, status, cookies, forwarded as _forwarded, redirect, delay, stream, har, echo, request, bins, gzip } from './routes'
const debug = debuglog('mockbin')

export default function router (options) {
  const router = Router()

  const defaults = [forwarded, errorHandler, bodyParser, null, cors, poweredBy, negotiateContent]

  const endpoints = [
    { action: 'get', path: '/', route: hello },
    { action: 'all', path: '/ip', route: ips.one },
    { action: 'all', path: '/ips', route: ips.all },
    { action: 'all', path: '/agent', route: headers.agent },
    { action: 'all', path: '/status/:code/:reason?', route: status },
    { action: 'all', path: '/headers', route: headers.all },
    { action: 'all', path: '/header/:name', route: headers.one },
    { action: 'all', path: '/header/:name/:value', route: headers.set },
    { action: 'all', path: '/cookies', route: cookies.all },
    { action: 'all', path: '/forwarded', route: _forwarded },
    { action: 'all', path: '/cookie/:name', route: cookies.one },
    { action: 'all', path: '/cookie/:name/:value', route: cookies.set },
    { action: 'all', path: '/redirect/:status_code/:count?', route: redirect },
    { action: 'all', path: '/delay/:ms?', route: delay },
    { action: 'all', path: '/stream/:chunks?', route: stream },
    { action: 'all', path: '/har*', route: har },
    { action: 'all', path: '/echo*', route: echo },
    { action: 'all', path: '/request*', route: request }
  ]

  endpoints.forEach(function (endpoint) {
    // add route to middleware
    defaults.splice(3, 1, endpoint.route)

    // assign router to action at path
    router[endpoint.action].apply(router, [endpoint.path].concat(defaults))
  })

  if (options && options.redis) {
    router.use('/bin', bins(options.redis))
  } else {
    debug('no redis dsn provided, will not load bin routes')
  }

  // duplicate routes with gzip forced
  router.use('/gzip', gzip, compression, Object.assign(router))

  return router
}
