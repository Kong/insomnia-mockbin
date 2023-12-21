export default function forwarded(req, res, next) {
	res.body = req.forwarded;

	next();
}
