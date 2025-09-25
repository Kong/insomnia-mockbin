module.exports = (req, res, next) => {
	req.app.disable("x-powered-by");
	next();
};
