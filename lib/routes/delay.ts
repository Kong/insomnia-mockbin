module.exports = function (req, res, next) {
	let delay = req.params.ms ? Number.parseInt(req.params.ms, 10) : 200;

	if (delay > 60000) {
		delay = 60000;
	}

	setTimeout(() => {
		res.body = {
			delay: delay,
		};

		next();
	}, delay);
};
