'use strict'

var debug = require('debug-log')('mockbin')
var pkg = require('../../../package.json')

module.exports = function (req, res, next) {
  var self = this
  res.view = 'bin/manage'

  self.client.keys('bin:*', function (err, ids) {
    if (err) {
      debug(err)
      throw err
    }

    self.client.multi(
      ids.map(function (id) { return [ 'lrange', id.replace('bin:', 'log:'), -1, -1 ] })
    ).exec(function (err, replies) {
      if (err) {
        debug(err)
        throw err
      }

      self.client.multi(
        ids.map(function (id) { return [ 'get', id ] })
      ).exec(function (err, entities) {
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
            entries: []
          }
        }

        replies.forEach(function (results, index) {
          var items
          var entity = JSON.parse(entities[index])
          var id = ids[index]
          if (results.length) {
            items = results.map(function (str) {
              return Object.assign(JSON.parse(str), { bin: id,
                                                      id: id.replace('bin:', ''),
                                                      locked: entity.locked })
            })
          } else {
            items = [ { bin: ids[index], id: ids[index].replace('bin:', ''), startedDateTime: '<new>' } ]
          }
          res.body.bin.entries = res.body.bin.entries.concat(items)
        })

        next()
      })
    })
  })
}
