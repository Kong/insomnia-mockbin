'use strict'

var debug = require('debug-log')('mockbin')
var util = require('util')
var uuid = require('node-uuid')
var validate = require('har-validator')

module.exports = function (req, res, next) {
  var mock = req.jsonBody

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
      var id = uuid.v4()

      this.client.set('bin:' + id, JSON.stringify(mock))

      res.view = 'redirect'
      res.status(201).location(util.format('/bin/%s', id)).body = id
    }.bind(this))

    .catch(function (err) {
      res.body = {
        errors: err.errors
      }
    })

    .then(next)
}
