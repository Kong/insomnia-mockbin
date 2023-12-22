/* global describe, it */

import delay from "../../lib/routes/delay.js";

import "should";

describe("/delay/:ms", function () {
	this.timeout(210);

	it("should not timeout", (done) => {
		const res = {};
		const req = {
			params: {
				ms: 10,
			},
		};

		delay(req, res, () => {
			res.body.should.eql({
				delay: req.params.ms,
			});

			done();
		});
	});

	it("should default to 200ms", (done) => {
		const res = {};
		const req = {
			params: {},
		};

		delay(req, res, () => {
			res.body.should.eql({
				delay: 200,
			});

			done();
		});
	});
});
