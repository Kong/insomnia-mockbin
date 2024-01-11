const debug = require("debug")("mockbin");

module.exports = function (req, res, next) {
	const compoundId = req.params.uuid + req.params[0];
	this.client.del(`bin:${compoundId}`, (err) => {
		if (err) {
			debug(err);

			throw err;
		}
		next();
	});

	this.client.del(`log:${compoundId}`, (err) => {
		if (err) {
			debug(err);

			throw err;
		}
		next();
	});
};
