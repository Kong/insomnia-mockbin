'use strict';

module.exports = function (req, res, next) {
  // force compression
  req.headers['accept-encoding'] = 'gzip';

  next();
};
