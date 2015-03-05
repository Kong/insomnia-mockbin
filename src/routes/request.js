'use strict';

module.exports = function (req, res, next) {
  res.yamlInline = 6;

  res.body = req.simple;

  next();
};
