var express         = require('express');
var params          = require('express-params');
var methodOverride  = require('method-override');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var compression     = require('compression');
var morgan          = require('morgan');
var multer          = require('multer');

var YAML            = require('yamljs');
var XML             = require('jsontoxml');

var app = express();

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
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method'));

// parse cookies
app.use(cookieParser());

// parse all body types
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// handle multipart/form-data
app.use(multer());

// gzipping when needed
app.use(compression({
  threshold: 1
}));

// construct HAR Object
app.use(function (req, res, next) {
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

  res.har = {
    request: {
      method: req.method,
      url: req.protocol + '://' + req.hostname + req.originalUrl,
      httpVersion: "HTTP/1.1",
      // TODO
      cookies: req.cookies,
      headers: objectToArray(req.headers),
      queryString: objectToArray(req.query),
      postData: req.body,
      headersSize: getReqHeaderSize(),
      bodySize: 0
    }
  };

  res.set('X-Powered-By', 'httpconsole.com');

  next();
});

// setup custom params
params.extend(app);
app.param('status_code', Number);
app.param('status_message', /^[\w\t ]+$/);

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

app.all('/user-agent', function (req, res, next) {
  res.body = req.headers['user-agent'];

  next();
});

app.all('/status/:status_code/:status_message?', function (req, res, next) {
  res.statusCode = req.params.status_code || 200;
  res.statusMessage = req.params.status_message || 'OK';

  next();
});

app.all('/headers', function (req, res, next) {
  res.body = {
    headers: res.har.request.headers,
    headersSize: res.har.request.headersSize
  };

  next();
});

app.all('/request', function (req, res, next) {
  res.body = res.har;

  next();
});

app.all('/gzip', function (req, res, next) {
  // force compression
  req.headers['accept-encoding'] = 'gzip';
  res.status(200).body = res.har;

  next();
});

app.use(function (req, res, next) {
  res.format({
    html: function(){
      res.send(res.body);
    },

    json: function(){
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
