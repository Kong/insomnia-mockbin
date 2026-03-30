const debug = require("debug")("mockbin");

module.exports = (err, req, res, next) => {
	debug(err);
	console.error(err);
	if (res.headersSent) {
		return next(err);
	}

	res
		.status(err.status || 500)
		.send(`Internal Server Error:\n${err.stack || err.message}`);
};
