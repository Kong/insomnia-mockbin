const debug = require("debug")("mockbin");

module.exports = (client) => (req, res, next) => {
	client.get(`bin:${req.params.uuid + req.params[0]}`, (err, value) => {
		if (err) {
			debug(err);

			throw err;
		}

		if (value) {
			const har = JSON.parse(value);

			res.view = "bin/view";
			res.body = har;
		}

		next();
	});
};
