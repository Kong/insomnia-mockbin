'use strict'

export const one = function oneIP (req, res, next) {
  res.body = req.ip

  next()
}
export const all = function allIPs (req, res, next) {
  res.body = req.forwarded.for

  next()
}
