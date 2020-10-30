var Dicer = require("dicer");
var querystring = require("querystring");
var contentTypeParser = require("content-type");
var util = require("../utils");

const parseContentType = (contentTypeHeader) => {
  if (!contentTypeHeader) {
    return { contentType: null };
  }
  var { type, parameters } = contentTypeParser.parse(contentTypeHeader);
  return {
    contentType: type.replace(/\+$/, ""),
    parameters,
  };
};

module.exports = (req, res, next) => {
  req.bodyChunks = [];

  req.on("data", (chunk) => {
    req.bodyChunks.push(chunk);
  });

  req.on("end", () => {
    req.rawBody = Buffer.concat(req.bodyChunks);
    req.body = req.rawBody.toString("utf8");
    req.bodySize = req.rawBody.length;
    req.jsonBody = null;
    req.formBody = null;
    req.contentType = null;
    req.multiPartSimple = {};

    // parse Content-Type
    var contentTypeHeader = req.headers["content-type"];
    var { contentType, parameters } = parseContentType(contentTypeHeader);

    if (contentType) {
      req.contentType = contentType;
    }

    // create HAR Object
    req.har = util.createHar(req);
    req.simple = util.createSimpleHar(req);

    switch (req.contentType) {
      case "application/json":
        try {
          req.jsonBody = JSON.parse(req.body);
        } catch (exception) { }

        next();
        break;

      case "application/x-www-form-urlencoded":
        req.formBody = querystring.parse(req.body);

        // update HAR objects
        req.simple.postData.params = req.formBody;
        req.har.log.entries[0].request.postData.params = util.objectToArray(
          req.formBody,
        );

        next();
        break;

      case "multipart/mixed":
      case "multipart/related":
      case "multipart/form-data":
      case "multipart/alternate":
        req.multiPartData = [];
        req.multiPartParams = [];

        // parse a file upload
        var dice = new Dicer({
          boundary: parameters.boundary,
        });

        dice.on("part", (part) => {
          part.on("data", (data) => {
            req.multiPartData.push(data.toString("utf8"));
          });

          part.on("header", (headers) => {
            var param = {};

            if (headers["content-disposition"]) {
              var disposition = contentTypeParser.parse(
                headers["content-disposition"][0].replace(
                  "form-data",
                  "form-data/text",
                ) || "form-data/text",
              );

              param.name = disposition.parameters.name;

              if (disposition.parameters.filename) {
                param.fileName = disposition.parameters.filename;
              }
            }

            if (headers["content-type"]) {
              var { contentType: partContentType } = parseContentType(
                headers["content-type"][0] || "application/octet-stream",
              );

              param.contentType = partContentType;
            }

            req.multiPartParams.push(param);
          });
        });

        dice.on("finish", () => {
          // createa a new simple object param
          req.multiPart = req.multiPartParams.map((param, index) => {
            // append value to pair
            param.value = req.multiPartData[index];

            switch (typeof req.multiPartSimple[param.name]) {
              case "undefined":
                req.multiPartSimple[param.name] = param.value;
                break;

              // array
              case "object":
                req.multiPartSimple[param.name].push(param.value);
                break;

              case "string":
                // this exists? must be an array, make it so
                req.multiPartSimple[param.name] = [
                  req.multiPartSimple[param.name],
                ];
                req.multiPartSimple[param.name].push(param.value);
                break;
            }

            return param;
          });

          // update HAR objects
          req.simple.postData.params = req.multiPartSimple
            ? req.multiPartSimple
            : [];
          req.har.log.entries[0].request.postData.params = req.multiPart
            ? req.multiPart
            : [];

          next();
        });

        dice.write(req.body);
        break;

      default:
        next();
    }
  });
};
