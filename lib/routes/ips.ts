module.exports = {
	one: function oneIP(req, res, next) {
		res.body = req.ip;

		next();
	},
};
