/* global describe, it */

import har from "../../lib/routes/har.js";

import "should";

describe("/har", () => {
	// not much to test here, actual endpoint logic is tested elsewhere
	it("should return object", (done) => {
		const res = {};
		const req = {
			har: "foo",
		};

		har(req, res, () => {
			res.body.should.equal(req.har);

			done();
		});
	});
});
