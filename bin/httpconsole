#!/usr/bin/env node

'use strict';

var pkg = require('../package.json');
var commander = require('commander');
var HTTPConsole = require('../src');

commander
  .version(pkg.version)
  .option('-q, --quiet', 'Disable console logging')
  .option('-p, --port <port>', 'Port that the http server will use. Default is 8080.', '8080')
  .parse(process.argv);

HTTPConsole().createServer().start();
