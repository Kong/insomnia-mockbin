'use strict'

var debug = require('debug-log')('mockbin')
var pkg = require('../../../package.json')
var util = require('util')
var validate = require('har-validator')
// var uuid = require('node-uuid')

module.exports = function (req, res, next) {
  switch (req.method) {
    case 'POST': handlePost.call(this, req, res, next); break
    default: handleGet.call(this, req, res, next); break
  }
}

function handleGet (req, res, next) {
  res.view = 'bin/edit'
  this.client.get('bin:' + req.params.uuid, function (err, data) {
    if (err) {
      debug(err)
      throw err
    }

    res.body = {
      bin: {
        version: '1.2',
        creator: {
          name: 'mockbin.com',
          version: pkg.version
        },
        id: req.params.uuid,
        entry: JSON.parse(data)
      }
    }

    next()
  })
}

function handlePost (req, res, next) {
  var mock

  // check for full HAR
  if (req.jsonBody && req.jsonBody.response) {
    mock = req.jsonBody.response
  }

  // exception for the web Form
  // TODO eliminate this and rely on req.simple.postData.text
  if (req.simple.postData.params && req.simple.postData.params.response) {
    try {
      mock = JSON.parse(req.simple.postData.params.response)
    } catch (e) {
      debug(e)
    }
  }

  // overritten by application/x-www-form-urlencoded or multipart/form-data
  if (req.simple.postData.text) {
    try {
      mock = JSON.parse(req.simple.postData.text)
    } catch (e) {
      debug(e)
    }
  }

  // provide optional values before validation
  mock.redirectURL = ''
  mock.bodySize = 0
  mock.headersSize = 0

  if (!mock.content) {
    mock.content = {}
  }

  mock.content.size = 0

  validate.response(mock)
    .then(function () {
      var location, body

      this.client.set('bin:' + req.params.uuid, JSON.stringify(mock))

      if (mock.locked !== 'true') {
        location = util.format('/bin/%s/edit', req.params.uuid)
        body = {
          // duped code
          bin: {
            version: '1.2',
            creator: {
              name: 'mockbin.com',
              version: pkg.version
            },
            id: req.params.uuid,
            entry: mock
          }
        }
      } else {
        location = util.format('/bin/%s', req.params.uuid)
        body = req.params.uuid
      }

      res.view = 'redirect'
      res.status(201).location(location).body = body
    }.bind(this))

    .catch(function (err) {
      res.body = {
        errors: err.errors
      }
    })

    .then(next)
}
