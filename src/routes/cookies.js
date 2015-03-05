'use strict';

module.exports = {
  all: function (req, res, next) {
    res.body = req.har.log.entries[0].request.cookies;

    next();
  },

  one: function (req, res, next) {
    res.body = req.cookies ? req.cookies[req.params.name.toLowerCase()] : false;

    next();
  }
};
