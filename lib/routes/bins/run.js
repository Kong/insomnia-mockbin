'use strict'

const util = require('util')
const debug = util.debuglog('mockbin')

module.exports = function (req, res, next) {
  this.client.get('bin:' + req.params.uuid, function (err, value) {
    if (err) {
      debug(err)

      throw err
    }

    if (value) {
      const har = JSON.parse(value)

      // log interaction & send the appropriate response based on HAR
      this.client.rpush('log:' + req.params.uuid, JSON.stringify(req.har.log.entries[0]))
      this.client.ltrim('log:' + req.params.uuid, 0, 100)

      // headers
      har.headers.forEach(function (header) {
        res.set(header.name, header.value)
      })

      // cookies
      har.cookies.forEach(function (cookie) {
        res.cookie(cookie.name, cookie.value)
      })

      // status
      res.httpVersion = har.httpVersion.split('/')[1]
      res.statusCode = har.status || 200
      res.statusMessage = har.statusText || 'OK'

      // special condition
      if (har.redirectURL !== '') {
        res.location(har.redirectURL)
      }

      return res.send(har.content.text ? har.content.text : null)
    }

    next()
  }.bind(this))
}
