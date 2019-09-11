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

console.log(mock);

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

console.log(mock);

  if(mock != null) {
      
    // Cteate Bin key for redis to use
    var id = uuid.v4()

    // Actually add it to redis based at key uuid
    this.client.set('bin:' + id, JSON.stringify(mock))

    // No error, return  201 created
    res.view = 'redirect'
    res.status(201).location(util.format('/bin/%s', id)).body = id

  } else {
   
    res.view = 'redirect'
    res.status(500).body = "Error parsing JSON payload";
  } 

  next()
}
