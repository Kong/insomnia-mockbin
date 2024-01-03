/* global describe, it */

'use strict'

var redirect = require('../../lib/routes/redirect')

require('should')

var res = {
  redirect: function (status, target) {
    res.status = status
    res.target = target
  }
}

describe('/redirect/:status_code/:count', function () {
  it('should use default values', function (done) {
    var req = {
      query: {},
      params: {}
    }

    redirect(req, res)
    res.status.should.equal(302)
    res.target.should.equal('/redirect/302/0')

    done()
  })

  it('should use redirect x times', function (done) {
    var req = {
      query: {},

      params: {
        count: 3
      }
    }

    redirect(req, res)
    res.status.should.equal(302)
    res.target.should.equal('/redirect/302/2')

    done()
  })

  it('should use redirect with custom status', function (done) {
    var req = {
      query: {},

      params: {
        count: 3,
        status_code: 308
      }
    }

    redirect(req, res)
    res.status.should.equal(308)
    res.target.should.equal('/redirect/308/2')

    done()
  })

  it('should use redirect to custom target eventually', function (done) {
    var req = {
      query: {
        to: 'http://mockbin.org'
      },

      params: {
        count: 3,
        status_code: 308
      }
    }

    redirect(req, res)
    res.status.should.equal(308)
    res.target.should.equal('/redirect/308/2?to=http://mockbin.org')

    done()
  })

  it('should use redirect to custom target', function (done) {
    var req = {
      query: {
        to: 'http://mockbin.org'
      },

      params: {
        count: 1,
        status_code: 308
      }
    }

    redirect(req, res)
    res.status.should.equal(308)
    res.target.should.equal('http://mockbin.org')

    done()
  })

  it('should reject invalid redirect status code', function (done) {
    var req = {
      params: {
        status_code: 400
      }
    }

    redirect(req, res, function () {
      res.body.should.have.property('error')
      res.body.error.should.equal('invalid status code, must be one of 300,301,302,303,307,308')
      done()
    })
  })

  it('should finish redirecting', function (done) {
    var req = {
      query: {},
      params: {
        count: '0'
      }
    }

    redirect(req, res, function () {
      res.body.should.equal('redirect finished')
      done()
    })
  })
})
