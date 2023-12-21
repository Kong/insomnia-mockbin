export const one = function oneHeader(req, res, next) {
	const name = req.params.name.toLowerCase();

	res.body = req.headers
		? req.headers[name]
			? req.headers[name]
			: false
		: false;

	next();
};

export const agent = function agent(req, res, next) {
	req.params.name = "user-agent";

	one(req, res, next);
};

export const set = function setHeader(req, res, next) {
	res.set(req.params.name, req.params.value);

	res.body = req.params.value;

	next();
};

export const all = function allHeaders(req, res, next) {
	res.yamlInline = 2;

	res.body = {
		headers: req.har.log.entries[0].request.headers,
		headersSize: req.har.log.entries[0].request.headersSize,
	};

	next();
};

export default { one, agent, set, all };
