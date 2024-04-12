const debug = require("debug")("mockbin");

module.exports = (client) => (req, res, next) => {
	const compoundId = req.params.serviceid + req.params.custompath;
	client.del(`bin:${compoundId}`, (err) => {
		if (err) {
			debug(err);

			throw err;
		}
		next();
	});

	client.del(`log:${compoundId}`, (err) => {
		if (err) {
			debug(err);

			throw err;
		}
		next();
	});
};
