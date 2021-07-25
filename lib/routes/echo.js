'use strict'

module.exports = function echo (req, res) {
  res.type(req.headers['content-type'] || 'text/plain')
  res.send(req.body || '')
}
