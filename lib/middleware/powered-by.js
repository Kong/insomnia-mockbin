module.exports = (req, res, next) => {
	req.app.disable("x-powered-by");

	res.set("X-Powered-By", "mockbin");

	next();
};
