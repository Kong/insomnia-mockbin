const debug = require("debug")("mockbin");

module.exports = (err, req, res, next) => {
	debug(err);

	res.status(err.status || 500).view = "error";

	next();
};
