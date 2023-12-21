export const one = function oneCookie(req, res, next) {
	const name = req.params.name.toLowerCase();

	res.body = req.cookies
		? req.cookies[name]
			? req.cookies[name]
			: false
		: false;

	next();
};

export const set = function setCookie(req, res, next) {
	res.cookie(req.params.name, req.params.value);

	res.body = req.params.value;

	next();
};

export const all = function allCookies(req, res, next) {
	res.body = req.har.log.entries[0].request.cookies;

	next();
};

export default { one, set, all };
