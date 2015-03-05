'use strict';

var express = require('express');
var routes = require('./routes');
var mw = require('./middleware');

module.exports = function (config, redis) {
  var router = express.Router();

  // add httpconsole middlewares
  // router.use(mw.utilMiddleware);

  router.get('/',                               mw.errorHandler, mw.cors, mw.bodyParser, routes.hello,           mw.negotiateContent);

  router.all('/ip',                             mw.errorHandler, mw.cors, mw.bodyParser, routes.ips.one,         mw.negotiateContent);

  router.all('/ips',                            mw.errorHandler, mw.cors, mw.bodyParser, routes.ips.all,         mw.negotiateContent);

  router.all('/agent',                          mw.errorHandler, mw.cors, mw.bodyParser, routes.headers.agent,   mw.negotiateContent);

  router.all('/status/:code/:reason?',          mw.errorHandler, mw.cors, mw.bodyParser, routes.status,          mw.negotiateContent);

  router.all('/headers',                        mw.errorHandler, mw.cors, mw.bodyParser, routes.headers.all,     mw.negotiateContent);

  router.all('/header/:name',                   mw.errorHandler, mw.cors, mw.bodyParser, routes.headers.one,     mw.negotiateContent);

  router.all('/cookies',                        mw.errorHandler, mw.cors, mw.bodyParser, routes.cookies.all,     mw.negotiateContent);

  router.all('/cookie/:name',                   mw.errorHandler, mw.cors, mw.bodyParser, routes.cookies.one,     mw.negotiateContent);

  router.all('/redirect/:status_code/:count?',  mw.errorHandler, mw.cors, mw.bodyParser, routes.redirect,        mw.negotiateContent);

  router.all('/delay/:ms?',                     mw.errorHandler, mw.cors, mw.bodyParser, routes.delay,           mw.negotiateContent);

  router.all('/stream/:chunks?',                mw.errorHandler, mw.cors, mw.bodyParser, routes.stream,          mw.negotiateContent);

  router.all('/echo',                           mw.errorHandler, mw.cors, mw.bodyParser, routes.echo,            mw.negotiateContent);

  router.all('/debug*',                         mw.errorHandler, mw.cors, mw.bodyParser, routes.debug,           mw.negotiateContent);

  router.all('/request*',                       mw.errorHandler, mw.cors, mw.bodyParser, routes.request,         mw.negotiateContent);

  router.all('/gzip',                           mw.errorHandler, mw.cors, mw.bodyParser, routes.gzip,            mw.negotiateContent);

  router.get('/bucket/create',                  mw.errorHandler, mw.cors, mw.bodyParser, routes.buckets.form,    mw.negotiateContent);

  router.post('/bucket/create',                 mw.errorHandler, mw.cors, mw.bodyParser, routes.buckets.create,  mw.negotiateContent);

  router.get('/bucket/:uuid/view',              mw.errorHandler, mw.cors, mw.bodyParser, routes.buckets.view,    mw.negotiateContent);

  router.all('/bucket/:uuid',                   mw.errorHandler, mw.cors, mw.bodyParser, routes.buckets.send,    mw.negotiateContent);

  router.get('/bucket/:uuid/log',               mw.errorHandler, mw.cors, mw.bodyParser, routes.buckets.log,     mw.negotiateContent);

  return router;
};
