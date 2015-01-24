'use strict';

var compression     = require('compression');
var cookieParser    = require('cookie-parser');
var dicer           = require('dicer');
var dotenv          = require('dotenv');
var express         = require('express');
var methodOverride  = require('method-override');
var morgan          = require('morgan');
var pkg             = require('./package.json');
var params          = require('express-params');
var qs              = require('qs');
var redis           = require('redis');
var schema          = require('./schema.json');
var tv4             = require('tv4');
var typer           = require('media-typer');
var url             = require('url');
var util            = require('util');
var uuid            = require('node-uuid');
var XML             = require('jsontoxml');
var YAML            = require('yamljs');

// load .env
dotenv.load();

// parse redis dsn
var dsn = url.parse(process.env.REDIS || process.env.REDISCLOUD_URL || process.env.npm_package_config_redis);

// connect to redis
var client = redis.createClient(dsn.port, dsn.hostname, {
  auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
});

client.on('error', function (err) {
  console.log('redis error:', err);
});

// start express
var app = express();

// TV4
tv4.addSchema(schema);

// fancy port
app.listen(process.env.PORT || process.env.npm_package_config_port);

// proxy ip resolution
app.set('json spaces', 2);
app.set('view engine', 'jade');
app.enable('trust proxy');
app.disable('x-powered-by');
app.disable('etag');

// jade locals
app.locals.YAML = YAML;
app.locals.XML = XML;

// enable logging
app.use(morgan('dev'));

// override with different headers + query string; last one takes precedence
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));

// static files
app.use('/static', express.static(__dirname + '/static'));

// parse cookies
app.use(cookieParser());

// gzipping when needed
app.use(compression({
  threshold: 1
}));

var objectToArray = function (obj) {
  if (!obj || typeof obj !== 'object') {
    return [];
  }

  var name;
  var results = [];
  var names = Object.keys(obj);

  while (name = names.pop()) {
    results.push({
      name: name,
      value: obj[name]
    });
  }

  return results;
};

var createHar = function (req) {
  var getReqHeaderSize = function () {
    var keys = Object.keys(req.headers);

    var values = keys.map(function (key) {
      return req.headers[key];
    });

    var headers = req.method + req.url + req.versionMajor + req.versionMinor + keys.join() + values.join();

    // startline: [method] [url] HTTP/1.1\r\n = 12
    // endline: \r\n = 2
    // every header + \r\n = * 2
    return new Buffer(headers).length + (keys.length * 2) + 12 + 2;
  };

  return {
    log: {
      version: '1.2',
      creator: {
        name: 'httpconsole.com',
        version: pkg.version
      },
      entries: [{
        startedDateTime: new Date().toISOString(),
        clientIPAddress: req.ip,
        request: {
          method: req.method,
          url: req.protocol + '://' + req.hostname + req.originalUrl,
          httpVersion: 'HTTP/1.1',
          // TODO, add cookie details
          cookies: objectToArray(req.cookies),
          headers: objectToArray(req.headers),
          queryString: objectToArray(req.query),
          // TODO
          postData: {
            mimeType: req.contentType ? req.contentType : 'application/octet-stream',
            text: req.body,
            params: []
          },
          headersSize: getReqHeaderSize(),
          bodySize: req.rawBody.length
        }
      }]
    }
  };
};

// construct body
app.use(function (req, res, next) {
  req.bodyChunks = [];

  req.on('data', function (chunk) {
    req.bodyChunks.push(chunk);
  });

  req.on('end', function () {
    req.rawBody = Buffer.concat(req.bodyChunks);
    req.body = req.rawBody.toString('utf8');
    req.bodySize = req.rawBody.length;
    req.jsonBody = null;
    req.formBody = null;
    req.contentType = null;

    // parse Content-Type
    var type = req.headers['content-type'] ? typer.parse(req) : null;

    if (type) {
      req.contentType = [[type.type, type.subtype].join('/'), type.suffix].join('+').replace(/\+$/, '');
    }

    // create HAR Object
    req.har = createHar(req);

    // json
    switch (req.contentType) {
      case 'application/json':
        try {
          req.jsonBody = JSON.parse(req.body);
        } catch (exception) {}

        next();
        break;

      case 'application/x-www-form-urlencoded':
        req.formBody = qs.parse(req.body);

        // update HAR object
        req.har.log.entries[0].request.postData.params = objectToArray(req.formBody);

        next();
        break;

      case 'multipart/form-data':
        var stream = require('stream');
        var liner = new stream.Transform();

        req.multiPartData = [];
        req.multiPartParams = [];

        // parse a file upload
        var dice = new dicer({
          boundary: type.parameters.boundary
        });

        dice.on('part', function (part) {
          part.on('data', function (data) {
            req.multiPartData.push(data.toString('utf8'));
          });

          part.on('header', function (headers) {
            var param = {};

            if (headers['content-disposition']) {
              var disposition = typer.parse(headers['content-disposition'][0].replace('form-data', 'form-data/text'));

              param.name = disposition.parameters.name;

              if (disposition.parameters.filename) {
                param.fileName = disposition.parameters.filename;
              }
            }

            if (headers['content-type']) {
              var type = typer.parse(headers['content-type'][0]);

              param.contentType = [[type.type, type.subtype].join('/'), type.suffix].join('+').replace(/\+$/, '');
            }

            req.multiPartParams.push(param);
          });
        });

        dice.on('finish', function () {
          req.multiPart = req.multiPartParams.map(function (param, index) {
            param.value = req.multiPartData[index];
            return param;
          });

          // update HAR object
          req.har.log.entries[0].request.postData.params = req.multiPart ? req.multiPart : [];

          next();
        });

        liner.pipe(dice);
        liner.push(req.body);
        break;

      default:
        next();
    }
  });
});

app.use(function (req, res, next) {
  res.locals.path = req.path;
  res.locals.hostname = req.hostname;
  res.set('X-Powered-By', 'httpconsole.com');
  next();
});

var status_message = /^[\w\t '\+]+$/;

// setup custom params
params.extend(app);
app.param('status_code', Number);
app.param('status_message', status_message);
app.param('uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

// routes

app.get('/', function (req, res, next) {
  // TODO
  res.view = 'index';
  res.body = 'Hello World!';

  next();
});

app.all('/ip', function (req, res, next) {
  res.view = 'default';
  res.body = req.ip;

  next();
});

app.all('/ips', function (req, res, next) {
  res.view = 'default';
  res.body = req.ips;

  next();
});

app.all('/agent', function (req, res, next) {
  res.view = 'default';
  res.body = req.headers['user-agent'];

  next();
});

app.all('/status/:status_code/:status_message?', function (req, res, next) {
  res.view = 'default';

  res.statusCode = req.params.status_code || 200;
  res.statusMessage = (req.params.status_message[0] || 'OK').replace(/\+/g, ' ');

  res.body = {
    code: res.statusCode,
    message: res.statusMessage
  };

  next();
});

app.all('/headers', function (req, res, next) {
  res.view = 'default';

  res.body = {
    headers: req.har.log.entries[0].request.headers,
    headersSize: req.har.log.entries[0].request.headersSize
  };

  next();
});

app.all('/request', function (req, res, next) {
  res.view = 'default';
  res.locals.yamlInline = 6;

  res.body = req.har;

  next();
});

app.all('/gzip', function (req, res, next) {
  res.view = 'default';
  res.locals.yamlInline = 6;

  // force compression
  req.headers['accept-encoding'] = 'gzip';
  res.body = req.har;

  next();
});

// TODO display web form
app.get('/bin/create', function (req, res, next) {
  res.view = 'bin/create';

  next();
});

app.post('/bin/create', function (req, res, next) {
  var id = uuid.v4();

  var result = tv4.validateResult(req.jsonBody, schema.definitions.response);

  if (!result.valid) {
    res.status(400).body = {
      error: {
        code: result.error.code,
        message: result.error.message,
        params: result.error.params,
        dataPath: result.error.dataPath,
        schemaPath: result.error.schemaPath
      }
    };

    return next();
  }

  client.set(id, JSON.stringify(req.jsonBody));

  // send back the newly created id
  res.body = util.format('http://%s:%s/bin/%s', req.hostname, process.env.npm_package_config_port_mask || process.env.npm_package_config_port, id);
  res.location(res.body);

  next();
});

app.all('/bin/:uuid', function (req, res, next) {
  client.get(req.params.uuid, function (err, value) {
    if (err) {
      throw(err);
    }

    if (value) {
      var har = JSON.parse(value);

      // log interaction & send the appropriate response based on HAR
      if (req.query.__inspect === undefined) {
        client.rpush(req.params.uuid + '-requests', JSON.stringify(req.har.log.entries[0]));
        client.ltrim(req.params.uuid + '-requests', 0, 100);

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
      }

      // this is not even my final form!
      var type = typer.parse(har.content.mimeType).subtype;

      // only set the view template when its not an HTML response, or through manual override
      if (req.query.__inspect !== undefined || !~['html', 'xhtml'].indexOf(type)) {
        res.view = 'bin/view';
      }

      res.locals.har = har;

      res.body = har.content.text ? har.content.text : null;
    } else {
      res.status(404);
    }

    next();
  });
});

app.get('/bin/:uuid/requests', function (req, res, next) {
  res.view = 'bin/requests';

  client.lrange(req.params.uuid + '-requests', 0, -1, function (err, requests) {
    if (err) {
      throw(err);
    }

    res.body = {
      log: {
        version: '1.2',
        creator: {
          name: 'httpconsole.com',
          version: pkg.version
        }
      },
      entries: []
    };

    if (requests.length) {
      res.body.log.entries = requests.map(function (request) {
        return JSON.parse(request);
      });
    }

    next();
  });
});

app.get('/docs', function (req, res, next) {
  res.view = 'docs';

  next();
});

//  content negotiation
app.use(function (req, res, next) {
  if (typeof res.body !== 'object') {
    res.bodyXmlObj = {
      result: res.body
    };

    res.locals.bodyXmlObj = res.bodyXmlObj;
  }

  res.format({
    html: function () {
      if (res.view) {
        return res.render(res.view, {
          data: res.body
        });
      }

      res.send(YAML.stringify(res.body, 3, 2));
    },

    json: function () {
      res.json(res.body);
    },

    xml: function () {
      res.send(XML(res.bodyXmlObj || res.body, {
        prettyPrint: true,
        indent: '  '
      }).trim());
    },

    default: function () {
      res.send(YAML.stringify(res.body, 3, 2));
    }
  });

  next();
});
