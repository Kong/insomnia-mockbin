'use strict'

export default function rquest (req, res, next) {
  res.yamlInline = 6

  res.body = req.simple

  next()
}
