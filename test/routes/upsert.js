/* global describe, it */

const update = require("../../lib/routes/bins/update");
const { MAX_MOCK_BODY_LENGTH } = require("../../lib/utils");

require("should");

const UUID = `mock_${"a".repeat(32)}`;

const mockWithText = (text) => ({
	status: 200,
	statusText: "OK",
	httpVersion: "HTTP/1.1",
	headers: [],
	cookies: [],
	content: { size: 0, mimeType: "text/plain", text, compression: 0 },
	headersSize: -1,
	bodySize: -1,
	redirectURL: "",
});

// Runs the upsert handler with a fake Redis client and resolves with what it did.
const upsert = (mock) =>
	new Promise((resolve, reject) => {
		const saved = [];
		const client = { set: (...args) => saved.push(args) };
		const req = {
			headers: { "insomnia-mock-method": "GET" },
			params: { uuid: UUID, 0: "/hello" },
			jsonBody: mock,
			simple: { postData: { text: "" } },
		};
		const res = {
			status() {
				return this;
			},
			location() {
				return this;
			},
		};

		update(client)(req, res, (err) =>
			err ? reject(err) : resolve({ res, saved }),
		);
	});

describe("/bin/upsert", () => {
	describe("content.text length", () => {
		it("matches what LiquidJS can parse", () => {
			MAX_MOCK_BODY_LENGTH.should.equal(1000000);
		});

		it("saves a response body of exactly the maximum length", async () => {
			const { res, saved } = await upsert(
				mockWithText("a".repeat(MAX_MOCK_BODY_LENGTH)),
			);

			res.body.should.equal(UUID);
			saved.length.should.equal(1);
			saved[0][0].should.equal(`bin:${UUID}/hello`);
		});

		it("refuses a longer response body with a clear message", async () => {
			const { res, saved } = await upsert(
				mockWithText("a".repeat(MAX_MOCK_BODY_LENGTH + 1)),
			);

			res.body.error.should.equal("Invalid mock structure");
			res.body.message.should.equal(
				"The 'text' property must be of type string and can not exceed 1,000,000 characters.",
			);
			saved.should.be.empty();
		});

		it("still reports a response body that is not a string", async () => {
			const { res, saved } = await upsert(mockWithText(42));

			res.body.error.should.equal("Invalid mock structure");
			res.body.message.should.containEql("must be of type string");
			saved.should.be.empty();
		});
	});
});
