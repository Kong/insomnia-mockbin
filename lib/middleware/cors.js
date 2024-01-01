export default function (req, res, next) {
	res.set({
		"Access-Control-Allow-Origin": req.headers.origin || "*",
		"Access-Control-Allow-Methods":
			req.headers["access-control-request-method"] || req.method,
		"Access-Control-Allow-Headers":
			req.headers["access-control-request-headers"] ||
			Object.keys(req.headers).join(),
		"Access-Control-Allow-Credentials": "true",
	});
	next();
}
