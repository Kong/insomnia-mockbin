'use strict'

var debug = require('debug-log')('mockbin')
var Substution = require('../../utils').Substution

module.exports = function (req, res, next) {
  this.client.get('bin:' + req.params.uuid, function (err, value) {
    if (err) {
      debug(err)

      throw err
    }

    if (value) {
      var har = JSON.parse(value)
      var subs = new Substution(req, value)

      // log interaction & send the appropriate response based on HAR
      this.client.rpush('log:' + req.params.uuid, JSON.stringify(req.har.log.entries[0]))
      this.client.ltrim('log:' + req.params.uuid, 0, 100)

      // headers
      har.headers.map(function (header) {
        res.set(header.name, subs.searchAndReplace(header.value))
      })

      // cookies
      har.cookies.map(function (cookie) {
        res.cookie(cookie.name, subs.searchAndReplace(cookie.value))
      })

      // status
      res.httpVersion = har.httpVersion.split('/')[1]
      res.statusCode = subs.searchAndReplace((har.status || 200) + '')
      res.statusMessage = subs.searchAndReplace(har.statusText || 'OK')

      // special condition
      if (har.redirectURL !== '') {
        res.location(har.redirectURL)
      }

      if (har.content.text && typeof har.content.text === 'object') {
        Object.keys(har.content.text).forEach(function (item) {
          har.content.text[item] = subs.searchAndReplaceAll(har.content.text[item])
        })
      } else if (har.content.text) {
        har.content.text = subs.searchAndReplaceAll(har.content.text)
      } else {
        har.content.text = null
      }

      return res
        .type(har.content.mimeType || 'text/html')
        .send(har.content.text)
    }

    next()
  }.bind(this))
}
