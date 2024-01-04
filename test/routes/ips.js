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

describe("/ips", () => {
	it("should response with all address", (done) => {
		const res = {};
		const req = {
			forwarded: {
				for: {
					"0.0.0.0": -1,
					"1.1.1.1": -1,
				},
			},
		};

		ips.all(req, res, () => {
			res.body.should.equal(req.forwarded.for);

			done();
		});
	});
});
