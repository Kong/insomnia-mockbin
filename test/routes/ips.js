/* global describe, it */

const ips = require("../../lib/routes/ips");

require("should");

describe("/ip", () => {
	it("should response with ip address", (done) => {
		const res = {};
		const req = {
			ip: "0.0.0.0",
		};

		ips.one(req, res, () => {
			res.body.should.equal(req.ip);

			done();
		});
	});
});
