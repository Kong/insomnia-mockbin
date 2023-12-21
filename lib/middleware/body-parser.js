'use strict'

import Dicer from 'dicer'
import { parse } from 'querystring'
import { parse as _parse } from 'media-typer'
import { createHar, createSimpleHar, objectToArray } from '../utils.js'

export default function (req, res, next) {
  req.bodyChunks = []

  req.on('data', function (chunk) {
    req.bodyChunks.push(chunk)
  })

  req.on('end', function () {
    req.rawBody = Buffer.concat(req.bodyChunks)
    req.body = req.rawBody.toString('utf8')
    req.bodySize = req.rawBody.length
    req.jsonBody = null
    req.formBody = null
    req.contentType = null
    req.multiPartSimple = {}

    // parse Content-Type
    const contentType = req.headers['content-type']
    const type = contentType ? _parse(contentType) : null

    if (type) {
      req.contentType = [[type.type, type.subtype].join('/'), type.suffix].join('+').replace(/\+$/, '')
    }

    // create HAR Object
    req.har = createHar(req)
    req.simple = createSimpleHar(req)

    // json
    switch (req.contentType) {
      case 'application/json':
        try {
          req.jsonBody = JSON.parse(req.body)
        } catch (exception) { }

        next()
        break

      case 'application/x-www-form-urlencoded':
        req.formBody = parse(req.body)

        // update HAR objects
        req.simple.postData.params = req.formBody
        req.har.log.entries[0].request.postData.params = objectToArray(req.formBody)

        next()
        break

      case 'multipart/mixed':
      case 'multipart/related':
      case 'multipart/form-data':
      case 'multipart/alternate':
        req.multiPartData = []
        req.multiPartParams = []

        // parse a file upload
        var dice = new Dicer({
          boundary: type.parameters.boundary
        })

        dice.on('part', function (part) {
          part.on('data', function (data) {
            req.multiPartData.push(data.toString('utf8'))
          })

          part.on('header', function (headers) {
            const param = {}

            if (headers['content-disposition']) {
              const disposition = _parse(headers['content-disposition'][0].replace('form-data', 'form-data/text') || 'form-data/text')

              param.name = disposition.parameters.name

              if (disposition.parameters.filename) {
                param.fileName = disposition.parameters.filename
              }
            }

            if (headers['content-type']) {
              const type = _parse(headers['content-type'][0] || 'application/octet-stream')

              param.contentType = [[type.type, type.subtype].join('/'), type.suffix].join('+').replace(/\+$/, '')
            }

            req.multiPartParams.push(param)
          })
        })

        dice.on('finish', function () {
          // createa a new simple object param
          req.multiPart = req.multiPartParams.map(function (param, index) {
            // append value to pair
            param.value = req.multiPartData[index]

            switch (typeof req.multiPartSimple[param.name]) {
              case 'undefined':
                req.multiPartSimple[param.name] = param.value
                break

              // array
              case 'object':
                req.multiPartSimple[param.name].push(param.value)
                break

              case 'string':
                // this exists? must be an array, make it so
                req.multiPartSimple[param.name] = [req.multiPartSimple[param.name]]
                req.multiPartSimple[param.name].push(param.value)
                break
            }

            return param
          })

          // update HAR objects
          req.simple.postData.params = req.multiPartSimple ? req.multiPartSimple : []
          req.har.log.entries[0].request.postData.params = req.multiPart ? req.multiPart : []

          next()
        })

        dice.write(req.body)
        break

      default:
        next()
    }
  })
}
