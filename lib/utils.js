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
    return new Buffer(headers).length + (keys.length * 2) + 12 + 2
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
  },

  Substution: function (req, store) {
    var regMacros = /#(\w):(\/.*?\/\w*|.+?)(?::(\$\d+|[\s\w]+))?(?::((?:%|json|,)+))?#/g
    var regReg = /^[\/].*?[\/]\w?$/
    var regUnesc = /\\\\(.)/g
    var results = {}
    var typekeys = {}
    var kresult

    buildSubs([]).forEach(buildResult)

    kresult = Object.keys(results)

    function buildSubs (subs) {
      var match
      while ((match = regMacros.exec(store))) {
        subs.push(match.slice())
      }
      return subs
    }

    function buildResult (item) {
      // Creates the resulting data object for replacing the output data
      // { key : value, ... }
      // key : replacement pattern
      // value : the final value for replacement

      var key = item[0].replace(regUnesc, '\\$1')
      if (results[key]) { return }

      var type = item[1].toLowerCase()
      var queryKey = item[2].replace(regUnesc, '\\$1')
      var target = parseInt((item[3] || '$0').replace('$', ''))
      var enc = (item[4] || '').split(',')

      if (regReg.test(queryKey)) {
        try {
          // eslint-disable-next-line no-eval
          queryKey = eval(queryKey)
        } catch (e) {
          console.log(queryKey, e)
        }
      }

      var data = getDataFromReq(type)
      var resultSet

      if (typeof data === 'object') {
        var kdata = typekeys[type] || (typekeys[type] = Object.keys(data))
        resultSet = buildMatchListFromObject(kdata, data, target, queryKey)
      } else {
        resultSet = buildMatchListFromString(data, target, queryKey)
      }

      results[key] = encryptResults(enc, resultSet.join(','))
    }

    function getDataFromReq (type) {
      // Pulls the correct data object based on type
      // returns the data object
      var data = ''

      switch (type) {
        case 'h': data = req.headers; break
        case 'c': data = req.cookies; break
        // scheme
        case 's': data = req.protocol; break
        // host
        case 'd': data = req.hostname; break
        case 'p': data = req.url; break
        case 'q': data = req.query; break
        case 'b':
          switch (req.contentType.toLowerCase()) {
            case 'application/json': data = req.jsonBody; break
            default: console.log(req.contentType, req.body); data = req.body; break
          }
          break
      }
      return data
    }

    function buildMatchListFromObject (kdata, data, imatch, qkey) {
      // Builds the match data
      // returns list of matches
      var valuekeymatches = []
      // walk through the keys and record matches
      kdata.forEach(function (key) {
        var match = key.match(qkey)
          // this is just the key
        if (match && match[imatch]) {
          valuekeymatches.push(data[match[imatch]])
        }
      })
      return valuekeymatches
    }

    function buildMatchListFromString (data, imatch, qkey) {
      // Builds the match data
      // returns list of matches
      var valuekeymatches = []
      var match = data.match(qkey)
      if (match && match[imatch]) {
        valuekeymatches.push(match[imatch])
      }
      return valuekeymatches
    }

    function encryptResults (encs, input) {
      // Encrypts the result data
      // returns the modified input value
      encs.forEach(function (enc) {
        try {
          switch (enc) {
            case '%': input = encodeURI(input); break
            case 'json': input = JSON.stringify(input); break
          }
        } catch (e) {
          console.log(enc, input, e)
        }
      })
      return input
    }

    this.searchAndReplace = function (source) {
      for (var i = 0, l = kresult.length; i < l; i++) {
        var key = kresult[i]
        var repl = source.replace(key, results[key])
        if (repl !== source) {
          console.log('Replaced', key, source, repl)
          return repl
        }
      }
      console.log('Original', source)
      return source
    }

    this.searchAndReplaceAll = function (source) {
      for (var i = 0, l = kresult.length; i < l; i++) {
        var key = kresult[i]
        var repl = source.replace(key, results[key])
        if (repl !== source) {
          console.log('Replaced', key, source, repl)
          source = repl
        }
      }
      console.log('Original', source)
      return source
    }
  }
}

module.exports = utils
