/* global describe, it */

import request from "../../lib/routes/request";

import "should";

describe("/request", () => {
	// not much to test here, actual endpoint logic is tested elsewhere
	it("should return object", (done) => {
		const res = {};
		const req = {
			simple: "foo",
		};

		request(req, res, () => {
			res.body.should.equal(req.simple);

			done();
		});
	});
});
