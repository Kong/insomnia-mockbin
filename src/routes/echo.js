'use strict';

module.exports = function (req, res, next) {
  res.status(200);

  res.type(req.headers['content-type'] || 'text/plain');
  res.send(req.body);
};
