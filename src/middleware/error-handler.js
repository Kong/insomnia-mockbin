'use strict';

var debug = require('debug')('httpconsole');

module.exports = function (err, req, res, next) {
  debug(err);

  res.status(err.status || 500).view = 'error';

  next();
};
