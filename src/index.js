'use strict';

var debug = require('debug')('httpconsole');
var express = require('express');
var mw = require('./middleware');
var routes = require('./routes');

module.exports = function (config) {
  var router = express.Router();

  router.get('/',                               mw.errorHandler, mw.cors, mw.bodyParser, routes.hello,          mw.negotiateContent);

  router.all('/ip',                             mw.errorHandler, mw.cors, mw.bodyParser, routes.ips.one,        mw.negotiateContent);

  router.all('/ips',                            mw.errorHandler, mw.cors, mw.bodyParser, routes.ips.all,        mw.negotiateContent);

  router.all('/agent',                          mw.errorHandler, mw.cors, mw.bodyParser, routes.headers.agent,  mw.negotiateContent);

  router.all('/status/:code/:reason?',          mw.errorHandler, mw.cors, mw.bodyParser, routes.status,         mw.negotiateContent);

  router.all('/headers',                        mw.errorHandler, mw.cors, mw.bodyParser, routes.headers.all,    mw.negotiateContent);

  router.all('/header/:name',                   mw.errorHandler, mw.cors, mw.bodyParser, routes.headers.one,    mw.negotiateContent);

  router.all('/cookies',                        mw.errorHandler, mw.cors, mw.bodyParser, routes.cookies.all,    mw.negotiateContent);

  router.all('/cookie/:name',                   mw.errorHandler, mw.cors, mw.bodyParser, routes.cookies.one,    mw.negotiateContent);

  router.all('/redirect/:status_code/:count?',  mw.errorHandler, mw.cors, mw.bodyParser, routes.redirect,       mw.negotiateContent);

  router.all('/delay/:ms?',                     mw.errorHandler, mw.cors, mw.bodyParser, routes.delay,          mw.negotiateContent);

  router.all('/stream/:chunks?',                mw.errorHandler, mw.cors, mw.bodyParser, routes.stream,         mw.negotiateContent);

  router.all('/echo',                           mw.errorHandler, mw.cors, mw.bodyParser, routes.echo,           mw.negotiateContent);

  router.all('/har*',                           mw.errorHandler, mw.cors, mw.bodyParser, routes.har,            mw.negotiateContent);

  router.all('/request*',                       mw.errorHandler, mw.cors, mw.bodyParser, routes.request,        mw.negotiateContent);

  router.all('/gzip',                           mw.errorHandler, mw.cors, mw.bodyParser, routes.gzip,           mw.negotiateContent);

  if (config && config.redis) {
    router.use('/bucket', routes.buckets(config.redis));
  } else {
    debug('no redis dsn provided, will not load bucket routes');
  }

  return router;
};
