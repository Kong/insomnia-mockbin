export default function echo(req, res) {
	res.type(req.headers["content-type"] || "text/plain");
	res.send(req.body || "");
}
