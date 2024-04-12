const XML = require("xmlbuilder");
const YAML = require("yamljs");

module.exports = (req, res, next) => {
	res.bodyXmlObj = {
		response: res.body,
	};

	// am I pretty?
	const spaces = req.headers["x-pretty-print"]
		? Number.parseInt(req.headers["x-pretty-print"], 10)
		: 2;

	const xmlOpts = {
		pretty: spaces > 0,
		indent: new Array(spaces).join(" "),
		newline: "\n",
	};

	function YAMLResponse() {
		if (typeof res.body === "string") {
			return res.send(res.body);
		}

		res.send(YAML.stringify(res.body, 6, spaces));
	}

	function JSONResponse() {
		req.app.set("json spaces", spaces);

		res.jsonp(res.body);
	}

	function XMLResponse() {
		res.send(
			XML.create(res.bodyXmlObj || res.body, { allowSurrogateChars: true }).end(
				xmlOpts,
			),
		);
	}

	function HTMLResponse() {
		XML.create(res.bodyXmlObj, { allowSurrogateChars: true });
		res.render(res.view || "default", {
			req: req,
			res: res,
			data: {
				raw: res.body,
				yaml: YAML.stringify(res.body, res.yamlInline || 3, 2),

				json: JSON.stringify(res.body, null, 2),

				xml: XML.create(res.bodyXmlObj || res.body, {
					allowSurrogateChars: true,
				}).end(xmlOpts),
			},
		});
	}

	res.format({
		"application/json": JSONResponse,
		"text/json": JSONResponse,
		"text/x-json": JSONResponse,
		"application/x-json": JSONResponse,

		"text/javascript": JSONResponse,
		"application/javascript": JSONResponse,
		"application/x-javascript": JSONResponse,

		"text/xml": XMLResponse,
		"application/xml": XMLResponse,
		"application/x-xml": XMLResponse,

		"text/html": HTMLResponse,
		"application/xhtml+xml": HTMLResponse,

		"text/yaml": YAMLResponse,
		"text/x-yaml": YAMLResponse,
		"application/yaml": YAMLResponse,
		"application/x-yaml": YAMLResponse,

		"text/plain": YAMLResponse,

		default: JSONResponse,
	});

	next();
};
