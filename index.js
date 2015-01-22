var express         = require('express');
var params          = require('express-params');
var methodOverride  = require('method-override');
var cookieParser    = require('cookie-parser');
var compression     = require('compression');
var morgan          = require('morgan');
var dicer           = require('dicer');
var qs              = require('qs');
var tv4             = require('tv4');
var YAML            = require('yamljs');
var XML             = require('jsontoxml');
var util            = require('util');
var redis           = require('redis');
var uuid            = require('node-uuid');
var typer           = require('media-typer');

var schema          = require('./schema.json');

var app = express();

// TV4
tv4.addSchema(schema);

// fancy port
app.listen(3000);

// proxy ip resolution
app.enable('trust proxy');
app.disable('x-powered-by');
app.disable('etag');

// pretty print json
app.set('json spaces', 2);

// enable logging
app.use(morgan('dev'));

// override with different headers + query string; last one takes precedence
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));

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
  };
}

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
        req.jsonBody = JSON.parse(req.body);

        next();
        break;

      case 'application/x-www-form-urlencoded':
        req.formBody = qs.parse(req.body);

        // update HAR object
        req.har.request.postData.params = objectToArray(req.formBody);

        next();
        break;

      case 'multipart/form-data':
        var stream = require('stream');
        var liner = new stream.Transform()

        req.multiPartData = [];
        req.multiPartParams = [];

        // parse a file upload
        var dice = new dicer({ boundary: type.parameters.boundary });

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
          req.har.request.postData.params = req.multiPart ? req.multiPart : []

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
  res.set('X-Powered-By', 'httpconsole.com');
  next();
});

// setup custom params
params.extend(app);
app.param('status_code', Number);
app.param('status_message', /^[\w\t ]+$/);
app.param('uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

// routes

app.get('/', function (req, res) {
  // TODO
  res.send('Hello World!');
});

app.all('/ip', function (req, res, next) {
  res.body = req.ip;

  next();
});

app.all('/ips', function (req, res, next) {
  res.body = req.ips;

  next();
});

app.all('/agent', function (req, res, next) {
  res.body = req.headers['user-agent'];

  next();
});

app.all('/status/:status_code/:status_message?', function (req, res, next) {
  console.log(req.params.status_message[0]);

  res.statusCode = req.params.status_code || 200;
  res.statusMessage = req.params.status_message[0] || 'OK';

  res.body = {
    code: res.statusCode,
    message: res.statusMessage
  }

  next();
});

app.all('/headers', function (req, res, next) {
  res.body = {
    headers: req.har.request.headers,
    headersSize: req.har.request.headersSize
  };

  next();
});

app.all('/request', function (req, res, next) {
  res.body = req.har;

  next();
});

app.all('/gzip', function (req, res, next) {
  // force compression
  req.headers['accept-encoding'] = 'gzip';
  res.body = req.har;

  next();
});

app.post('/bin/create', function (req, res, next) {
  var id = uuid.v4();
  var client = redis.createClient();

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

  client.on('error', function (err) {
    console.log('redis error:', err);
  });


  client.set(id, JSON.stringify(req.jsonBody));
  client.quit();

  // send back the newly created id
  res.body = 'http://httpconsole.com/bin/' + id;
  res.location(res.body);

  next();
});

app.all('/bin/:uuid', function (req, res, next) {
  var client = redis.createClient();

  client.on('error', function (err) {
    console.log('redis error:', err);
  });

  client.get(req.params.uuid, function (err, value) {
    if (err) throw(err);

    if (value) {
      // log interaction
      client.rpush(req.params.uuid + '-requests', JSON.stringify(req.har));
      client.ltrim(req.params.uuid + '-requests', 0, 100);

      var har = JSON.parse(value);

      // headers
      har.headers.map(function (header) {
        res.set(header.name, header.value);
      })

      // cookies
      har.cookies.map(function (cookie) {
        res.cookie(cookie.name, cookie.value);
      })

      // status
      res.httpVersion = har.httpVersion.split('/')[1];
      res.statusCode = har.status || 200;
      res.statusMessage = har.statusText || 'OK';

      res.body = har.content.text ? har.content.text : null;
    } else {
      res.status(404);
    }

    client.quit();

    next();
  });
});

app.get('/bin/:uuid/requests', function (req, res, next) {
  var client = redis.createClient();

  client.on('error', function (err) {
    console.log('redis error:', err);
  });

  client.lrange(req.params.uuid + '-requests', 0, -1, function (err, requests) {
    if (err) throw(err);

    if (requests.length) {
      res.body = requests.map(function (request) {
        return JSON.parse(request);
      });
    } else {
      res.status(404);
    }

    client.quit();

    next();
  });
});

//  content negotiation
app.use(function (req, res, next) {
  res.format({
    html: function () {
      res.send(res.body);
    },

    json: function () {
      res.json(res.body);
    },

    xml: function () {
      res.send(XML(res.body, {
        prettyPrint: true,
        indent: '  '
      }));
    },

    default: function () {
      res.send(YAML.stringify(res.body, 2));
    }
  });

  next();
});
