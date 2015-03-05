'use strict';

var XML = require('xmlbuilder');
var YAML = require('yamljs');

module.exports = function (req, res, next) {
  if (typeof res.body !== 'object') {
    res.bodyXmlObj = {
      result: res.body
    };
  }

  // am I pretty?
  var spaces = req.headers['x-pretty-print'] ? parseInt(req.headers['x-pretty-print']) : false;

  function YAMLResponse () {
    if (typeof res.body === 'string') {
      return res.send(res.body);
    }

    res.send(YAML.stringify(res.body, 6, spaces));
  }

  function JSONResponse () {
    res.jsonp(res.body);
  }

  function XMLResponse () {
    res.send(XML.create(res.bodyXmlObj || res.body).end({
      pretty: spaces ? true : false,
      indent: new Array(spaces).join(' '),
      newline: '\n'
    }));
  }

  function HTMLResponse () {
    res.locals.path = req.path;
    res.locals.hostname = req.hostname;

    res.render(res.view || 'default', {
      data: {
        raw: res.body,
        yaml: YAML.stringify(res.body, res.yamlInline || 3, spaces),

        json: JSON.stringify(res.body, null, spaces),

        xml: XML.create(res.bodyXmlObj || res.body, {
          prettyPrint: true,
          indent: spaces
        }).end({
          pretty: true,
          indent: spaces,
          newline: '\n'
        })
      }
    });
  }

  res.format({
    'text/javascript': JSONResponse,
    'application/javascript': JSONResponse,
    'application/x-javascript': JSONResponse,

    'text/json': JSONResponse,
    'text/x-json': JSONResponse,
    'application/json': JSONResponse,
    'application/x-json': JSONResponse,

    'text/xml': XMLResponse,
    'application/xml': XMLResponse,
    'application/x-xml': XMLResponse,

    'text/html': HTMLResponse,
    'application/xhtml+xml': HTMLResponse,

    'text/yaml': YAMLResponse,
    'text/x-yaml': YAMLResponse,
    'application/yaml': YAMLResponse,
    'application/x-yaml': YAMLResponse,

    'text/plain': YAMLResponse,

    default: JSONResponse
  });

  next();
};
