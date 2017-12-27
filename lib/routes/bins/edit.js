'use strict'

var debug = require('debug-log')('mockbin')
var pkg = require('../../../package.json')
var util = require('util')
var validate = require('har-validator')
// var uuid = require('node-uuid')

module.exports = function (req, res, next) {
  var self = this

  switch( req.method ) {
    case 'POST': handlePost.call(this,req,res,next); break
    default: handleGet.call(this,req,res,next); break
  }
  // var mock = req.jsonBody || {}

  // on the params is the uuid data
  // query redis and get the bin data
  // the bin data will become the data
  // for the mock

  // request as get, load in data from store
  // request as post, update data to store
}

function handleGet (req,res,next) {
  res.view = 'bin/edit'
  console.log( "GET!", req.params.uuid )

  this.client.get( 'bin:' + req.params.uuid, function(err, data ) { 

    if(err) {
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

  } )
}

function handlePost (req,res,next) {
  var id = req.params.uuid, mock
  console.log( "POST!", req.params.uuid )

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
      this.client.set('bin:' + req.params.uuid, JSON.stringify(mock))

      res.view = 'bin/edit'
      res.status(201).location(util.format('/bin/%s/edit', req.params.uuid)).body = {
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
    }.bind(this))

    .catch(function (err) {
      res.body = {
        errors: err.errors
      }
    })

    .then(next)

}
