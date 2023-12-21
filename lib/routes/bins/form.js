export default function (req, res, next) {
	res.view = "bin/create";

	next();
}
