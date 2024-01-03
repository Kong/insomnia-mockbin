/* global describe, it */

'use strict'

var gzip = require('../../lib/routes/gzip')

require('should')

describe('/gzip/*', function () {
  // not much to test here, mostly compression middleware's job
  it('should force accept-encoding header', function (done) {
    var req = {
      headers: {}
    }

    gzip(req, {}, function () {
      req.headers.should.have.property('accept-encoding')
      req.headers['accept-encoding'].should.equal('gzip')

      done()
    })
  })
})
