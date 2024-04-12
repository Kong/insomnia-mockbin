const debug = require("debug")("mockbin");
const pkg = require("../../../package.json");

module.exports = (client) => (req, res, next) => {
	res.view = "bin/log";
	const compoundId = req.params.serviceid + req.params.custompath;
	client.lrange(`log:${compoundId}`, 0, -1, (err, history) => {
		if (err) {
			debug(err);

			throw err;
		}

		res.body = {
			log: {
				version: "1.2",
				creator: {
					name: "mockbin.com",
					version: pkg.version,
				},
				entries: [],
			},
		};

		if (history.length) {
			res.body.log.entries = history.map((request) => JSON.parse(request));
		}

		next();
	});
};
