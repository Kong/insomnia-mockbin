'use strict'

var debug = require('debug-log')('mockbin')

module.exports = function (req, res, next) {
  this.client.get('bin:' + req.params.uuid, function (err, value) {
    if (err) {
      debug(err)

      throw err
    }
    // delayed bin response
    var delay = req.params.ms ? parseInt(req.params.ms, 10) : 200

    if (delay > 60000) {
      delay = 60000
    }

    if (value) {
      var har = JSON.parse(value)

      // log interaction & send the appropriate response based on HAR
      this.client.rpush('log:' + req.params.uuid, JSON.stringify(req.har.log.entries[0]))
      this.client.ltrim('log:' + req.params.uuid, 0, 100)

      setTimeout(function () {

        // headers
        har.headers.map(function (header) {
          res.set(header.name, header.value)
        })

        // delay header
        res.set("mockbin-delay", delay)

        // cookies
        har.cookies.map(function (cookie) {
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

        res.body = har.content.text ? har.content.text : null

        next()
      }, delay)
    }
  }.bind(this))
}
