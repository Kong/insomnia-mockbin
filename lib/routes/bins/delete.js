const debug = require("debug")("mockbin");

module.exports = (client) => (req, res, next) => {
	const compoundId = req.params.uuid + req.params[0];
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
