'use strict';

var debug = require('debug')('mockbin');
var express = require('express');
var mw = require('../middleware');
var pkg = require('../../package.json');
var redis = require('redis');
var url = require('url');
var util = require('util');
var uuid = require('node-uuid');
var validate = require('har-validator');

var Buckets = function (dsn_str) {
  if (!(this instanceof Buckets)) {
    return new Buckets(dsn_str);
  }

  // parse redis dsn
  var dsn = url.parse(dsn_str);

  // connect to redis
  this.client = redis.createClient(dsn.port, dsn.hostname, {
    auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
  });

  this.client.on('error', function (err) {
    debug('redis error:', err);
  });

  var router = express.Router();

  router.get('/create',                  mw.errorHandler, mw.cors, mw.bodyParser, this.routes.form.bind(this),    mw.negotiateContent);

  router.post('/create',                 mw.errorHandler, mw.cors, mw.bodyParser, this.routes.create.bind(this),  mw.negotiateContent);

  router.get('/:uuid/view',              mw.errorHandler, mw.cors, mw.bodyParser, this.routes.view.bind(this),    mw.negotiateContent);

  router.get('/:uuid/log',               mw.errorHandler, mw.cors, mw.bodyParser, this.routes.log.bind(this),     mw.negotiateContent);

  router.all('/:uuid*',                  mw.errorHandler, mw.cors, mw.bodyParser, this.routes.send.bind(this),    mw.negotiateContent);

  return router;
};

Buckets.prototype.routes = {
  form: function (req, res, next) {
    res.status(200);

    res.view = 'bucket/create';

    next();
  },

  create: function (req, res, next) {
    // check for full HAR
    if (req.jsonBody.response) {
      req.jsonBody = req.jsonBody.response;
    }

    validate.response(req.jsonBody, function (err, valid) {
      if (!valid) {
        res.status(400).body = {
          error: err[0]
        };

        return next();
      }

      var id = uuid.v4();

      this.client.set(id, JSON.stringify(req.jsonBody));

      res.view = 'bucket/created';

      res.status(201);

      // send back the newly created id
      res.body = util.format('%s://%s/bucket/%s', req.protocol, req.hostname, id);
      res.location(res.body);

      next();
    }.bind(this));
  },

  view: function (req, res, next) {
    this.client.get(req.params.uuid, function (err, value) {
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
    this.client.get(req.params.uuid, function (err, value) {
      if (err) {
        debug(err);

        throw(err);
      }

      if (value) {
        var har = JSON.parse(value);

        // log interaction & send the appropriate response based on HAR
        this.client.rpush(req.params.uuid + '-log', JSON.stringify(req.har.log.entries[0]));
        this.client.ltrim(req.params.uuid + '-log', 0, 100);

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
    }.bind(this));
  },

  log: function (req, res, next) {
    res.status(200);

    res.view = 'bucket/log';

    this.client.lrange(req.params.uuid + '-log', 0, -1, function (err, history) {
      if (err) {
        debug(err);

        throw(err);
      }

      res.body = {
        log: {
          version: '1.2',
          creator: {
            name: 'mockbin.com',
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

module.exports = Buckets;
