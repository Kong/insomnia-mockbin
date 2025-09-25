const { validateRequestMethod } = require("../lib/validation");

describe("validateRequestMethod", () => {
	it("should accept valid HTTP methods", (done) => {
		const validMethods = [
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"PATCH",
			"OPTIONS",
			"HEAD",
		];

		for (const method of validMethods) {
			(() => validateRequestMethod(method)).should.not.throw();
		}
		done();
	});

	it("should throw error for invalid HTTP methods", (done) => {
		(() => validateRequestMethod("INVALID")).should.throw(
			"Invalid request method: INVALID",
		);
		(() => validateRequestMethod("trace")).should.throw(
			"Invalid request method: TRACE",
		);
		done();
	});

	it("should handle empty or null method gracefully", (done) => {
		(() => validateRequestMethod("")).should.not.throw();
		(() => validateRequestMethod(null)).should.not.throw();
		(() => validateRequestMethod(undefined)).should.not.throw();
		done();
	});
});
