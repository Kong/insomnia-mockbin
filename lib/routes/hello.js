'use strict'

export default function hello (req, res, next) {
  res.view = 'index'

  res.body = 'Hello World!'

  next()
}
