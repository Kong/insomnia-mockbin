'use strict';

var pkg = require('../../package.json');
var debug = require('debug')('httpconsole');
var util = require('util');
var uuid = require('node-uuid');
var validate = require('har-validator');

module.exports = {
  form: function (req, res, next) {
    res.status(200);

    res.view = 'bucket/create';

    next();
  },

  create: function (req, res, next) {
    validate(req.jsonBody, function (err, valid) {
      if (!err) {
        res.status(400).body = {
          error: err[0]
        };

        return next();
      }

      var id = uuid.v4();
      redis.set(id, JSON.stringify(req.jsonBody));
      res.view = 'bucket/created';

      res.status(201);

      // send back the newly created id
      res.body = util.format('http://%s:%s/bucket/%s', req.hostname, config.port_mask || config.port, id);
      res.location(res.body);

      next();
    });
  },

  view: function (req, res, next) {
    redis.get(req.params.uuid, function (err, value) {
      if (err) {
        debug(err);

        throw(err);
      }

      if (value) {
        var har = JSON.parse(value);

        res.status(200);

        res.view = 'bucket/view';
        res.body = har;
      }

      next();
    });
  },

  send: function (req, res, next) {
    redis.get(req.params.uuid, function (err, value) {
      if (err) {
        debug(err);

        throw(err);
      }

      if (value) {
        var har = JSON.parse(value);

        // log interaction & send the appropriate response based on HAR
        redis.rpush(req.params.uuid + '-log', JSON.stringify(req.har.log.entries[0]));
        redis.ltrim(req.params.uuid + '-log', 0, 100);

        // headers
        har.headers.map(function (header) {
          res.set(header.name, header.value);
        });

        // cookies
        har.cookies.map(function (cookie) {
          res.cookie(cookie.name, cookie.value);
        });

        // status
        res.httpVersion = har.httpVersion.split('/')[1];
        res.statusCode = har.status || 200;
        res.statusMessage = har.statusText || 'OK';

        // special condition
        if (har.redirectURL !== '') {
          res.location(har.redirectURL);
        }

        return res.send(har.content.text ? har.content.text : null);
      }

      next();
    });
  },

  log: function (req, res, next) {
    res.status(200);

    res.view = 'bucket/log';

    redis.lrange(req.params.uuid + '-log', 0, -1, function (err, history) {
      if (err) {
        debug(err);

        throw(err);
      }

      res.body = {
        log: {
          version: '1.2',
          creator: {
            name: 'httpconsole.com',
            version: pkg.version
          },
          entries: []
        }
      };

      if (history.length) {
        res.body.log.entries = history.map(function (request) {
          return JSON.parse(request);
        });
      }

      next();
    });
  }
};
