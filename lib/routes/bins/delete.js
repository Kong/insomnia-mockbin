var debug = require('debug')('mockbin')

module.exports = function (req, res, next) {
  this.client.del('bin:' + req.params.uuid, (err) => {
    if (err) {
      debug(err)

      throw err
    }
    next()
  })

  this.client.del('log:' + req.params.uuid, (err) => {
    if (err) {
      debug(err)

      throw err
    }
    next()
  })
}
