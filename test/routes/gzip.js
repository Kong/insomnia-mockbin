/* global describe, it */

const gzip = require("../../lib/routes/gzip");

require("should");

describe("/gzip/*", () => {
	// not much to test here, mostly compression middleware's job
	it("should force accept-encoding header", (done) => {
		const req = {
			headers: {},
		};

		gzip(req, {}, () => {
			req.headers.should.have.property("accept-encoding");
			req.headers["accept-encoding"].should.equal("gzip");

			done();
		});
	});
});
