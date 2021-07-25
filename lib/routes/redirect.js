'use strict'

import { format } from 'util'

export default function redirect (req, res, next) {
  let count = req.params.count ? parseInt(req.params.count, 10) : 1
  const status = parseInt(req.params.status_code, 10) || 302
  const valid = [300, 301, 302, 303, 307, 308]

  if (count > 100) {
    count = 100
  }

  if (!~valid.indexOf(status)) {
    res.body = {
      error: 'invalid status code, must be one of ' + valid.join()
    }

    return next()
  }

  if (count > 0) {
    if (count === 1 && req.query.to) {
      return res.redirect(status, req.query.to)
    }

    return res.redirect(status, format('/redirect/%d/%d%s', status, count - 1, req.query.to ? '?to=' + req.query.to : ''))
  }

  res.body = 'redirect finished'

  next()
}
