'use strict';

module.exports = function (req, res, next) {
  res.yamlInline = 6;

  // force compression
  res.status(200).append('accept-encoding', 'gzip').body = req.har;

  next();
};
