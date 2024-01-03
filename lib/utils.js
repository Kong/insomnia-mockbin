'use strict'

var pkg = require('../package.json')

var utils = {
  objectToArray: function (obj) {
    if (!obj || typeof obj !== 'object') {
      return []
    }

    var results = Object.keys(obj).reduce(function (results, name) {
      results.push({
        name: name,
        value: obj[name]
      })

      return results
    }, [])

    return results
  },

  getReqHeaderSize: function (req) {
    var keys = Object.keys(req.headers)

    var values = keys.map(function (key) {
      return req.headers[key]
    })

    var headers = req.method + req.url + req.versionMajor + req.versionMinor + keys.join() + values.join()

    // startline: [method] [url] HTTP/1.1\r\n = 12
    // endline: \r\n = 2
    // every header + \r\n = * 2
    return Buffer.from(headers).length + (keys.length * 2) + 12 + 2
  },

  createHar: function (req) {
    return {
      log: {
        version: '1.2',
        creator: {
          name: 'mockbin.com',
          version: pkg.version
        },
        entries: [{
          startedDateTime: new Date().toISOString(),
          clientIPAddress: req.ip,
          request: {
            method: req.method,
            url: req.forwarded.proto + '://' + req.hostname + req.originalUrl,
            httpVersion: 'HTTP/1.1',
            // TODO, add cookie details
            cookies: utils.objectToArray(req.cookies),
            headers: utils.objectToArray(req.headers),
            queryString: utils.objectToArray(req.query),
            // TODO
            postData: {
              mimeType: req.contentType ? req.contentType : 'application/octet-stream',
              text: req.body,
              params: []
            },
            headersSize: utils.getReqHeaderSize(req),
            bodySize: req.rawBody.length
          }
        }]
      }
    }
  },

  createSimpleHar: function (req) {
    return {
      startedDateTime: new Date().toISOString(),
      clientIPAddress: req.ip,
      method: req.method,
      url: req.forwarded.proto + '://' + req.hostname + req.originalUrl,
      httpVersion: 'HTTP/1.1',
      // TODO, add cookie details
      cookies: req.cookies,
      headers: req.headers,
      queryString: req.query,
      // TODO
      postData: {
        mimeType: req.contentType ? req.contentType : 'application/octet-stream',
        text: req.body,
        params: []
      },
      headersSize: utils.getReqHeaderSize(req),
      bodySize: req.rawBody.length
    }
  }
}

module.exports = utils
