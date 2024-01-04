/* global describe, it */

const request = require("../../lib/routes/request");

require("should");

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
