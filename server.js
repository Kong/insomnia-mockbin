'use strict';

var compression = require('compression');
var cookieParser = require('cookie-parser');
var debug = require('debug')('httpconsole');
var express = require('express');
var httpconsole = require('./src');
var methodOverride = require('method-override');
var morgan = require('morgan');
var rc = require('rc');
var redis = require('redis');
var url = require('url');

// default configs
var config = rc('httpconsole', {
  port: process.env.npm_package_config_port,
  port_mask: process.env.npm_package_config_port_mask,
  redis: process.env.npm_package_config_redis,
  quiet: process.env.npm_package_config_quiet === 'false' ? false : true
});

debug('system started with config %j', config);

if (config.redis) {
  // parse redis dsn
  var dsn = url.parse(config.redis);

  // connect to redis
  var client = redis.createClient(dsn.port, dsn.hostname, {
    auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
  });

  client.on('error', function (err) {
    debug('redis error:', err);
  });
} else {
  debug('no redis dsn provided, will not load bucket routes');
}

// express setup
var app = express();

app.set('jsonp callback name', '__callback');
app.set('view engine', 'jade');
app.enable('view cache');
app.enable('trust proxy');

// add 3rd party middlewares
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(compression());

// magic starts here
app.use('/', httpconsole(config, client));

if (!config.quiet) {
  app.use(morgan('dev'));
}

app.listen(config.port);
