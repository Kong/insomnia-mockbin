/* global describe, it */

import redirect from "../../lib/routes/redirect.js";

import "should";

const res = {
	redirect: (status, target) => {
		res.status = status;
		res.target = target;
	},
};

describe("/redirect/:status_code/:count", () => {
	it("should use default values", (done) => {
		const req = {
			query: {},
			params: {},
		};

		redirect(req, res);
		res.status.should.equal(302);
		res.target.should.equal("/redirect/302/0");

		done();
	});

	it("should use redirect x times", (done) => {
		const req = {
			query: {},

			params: {
				count: 3,
			},
		};

		redirect(req, res);
		res.status.should.equal(302);
		res.target.should.equal("/redirect/302/2");

		done();
	});

	it("should use redirect with custom status", (done) => {
		const req = {
			query: {},

			params: {
				count: 3,
				status_code: 308,
			},
		};

		redirect(req, res);
		res.status.should.equal(308);
		res.target.should.equal("/redirect/308/2");

		done();
	});

	it("should use redirect to custom target eventually", (done) => {
		const req = {
			query: {
				to: "http://mockbin.org",
			},

			params: {
				count: 3,
				status_code: 308,
			},
		};

		redirect(req, res);
		res.status.should.equal(308);
		res.target.should.equal("/redirect/308/2?to=http://mockbin.org");

		done();
	});

	it("should use redirect to custom target", (done) => {
		const req = {
			query: {
				to: "http://mockbin.org",
			},

			params: {
				count: 1,
				status_code: 308,
			},
		};

		redirect(req, res);
		res.status.should.equal(308);
		res.target.should.equal("http://mockbin.org");

		done();
	});

	it("should reject invalid redirect status code", (done) => {
		const req = {
			params: {
				status_code: 400,
			},
		};

		redirect(req, res, () => {
			res.body.should.have.property("error");
			res.body.error.should.equal(
				"invalid status code, must be one of 300,301,302,303,307,308",
			);
			done();
		});
	});

	it("should finish redirecting", (done) => {
		const req = {
			query: {},
			params: {
				count: "0",
			},
		};

		redirect(req, res, () => {
			res.body.should.equal("redirect finished");
			done();
		});
	});
});
