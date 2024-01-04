module.exports = (req, res, next) => {
	res.view = "bin/create";

	next();
};
