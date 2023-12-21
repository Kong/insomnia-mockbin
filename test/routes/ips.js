/* global describe, it */

import { all, one } from "../../lib/routes/ips.js";

import "should";

describe("/ip", () => {
	it("should response with ip address", (done) => {
		const res = {};
		const req = {
			ip: "0.0.0.0",
		};

		one(req, res, () => {
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

		all(req, res, () => {
			res.body.should.equal(req.forwarded.for);

			done();
		});
	});
});
