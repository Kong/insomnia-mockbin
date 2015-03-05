'use strict';

module.exports = function (req, res, next) {
  res.yamlInline = 6;

  // force compression
  req.set('accept-encoding', 'gzip').status(200).body = req.har;

  next();
};
