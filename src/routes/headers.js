'use strict';

module.exports = {
  all: function (req, res, next) {
    res.yamlInline = 2;

    res.status(200).body = {
      headers: req.har.log.entries[0].request.headers,
      headersSize: req.har.log.entries[0].request.headersSize
    };

    next();
  },

  one: function (req, res, next) {
    res.status(200).body = req.headers[req.params.name.toLowerCase()];

    next();
  },

  agent: function (req, res, next) {
    res.status(200).body = req.headers['user-agent'];

    next();
  }
};
