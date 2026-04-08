// test the bin creation

require("should");
const { v4: uuidv4 } = require("uuid");

describe("bins", () => {
	let binId;
	describe("/create", () => {
		it("should create a bin", async () => {
			const res = await fetch(`${process.env.MOCKBIN_HOST}/bin/create`, {
				method: "POST",
				body: JSON.stringify({
					status: 200,
					statusText: "OK",
					cookies: [],
					content: {
						size: 13,
						text: "Hello, world!",
						mimeType: "text/plain",
					},
					httpVersion: "HTTP/1.1",
				}),
			});

			const body = await res.text();

			res.status.should.equal(201);
			res.headers.get("location").should.match(/^\/bin\/[a-f0-9-]{36}$/);
			body.should.equal(
				JSON.stringify(res.headers.get("location").split("/").pop()),
			);

			binId = JSON.parse(body);
		});
	});

	describe("/view", () => {
		it("should view a bin by id", async () => {
			const res = await fetch(`${process.env.MOCKBIN_HOST}/bin/view/${binId}`);
			res.status.should.equal(200);
			const body = await res.json();
			body.should.have.property("status").equal(200);
			body.should.have.property("statusText").equal("OK");
			body.should.have.property("cookies").eql([]);
			body.should.have.property("httpVersion").equal("HTTP/1.1");
			body.should.have.property("content").match({
				text: "Hello, world!",
				mimeType: "text/plain",
			});
		});
	});

	describe("/sample", () => {
		it("should sample a bin by id", async () => {
			const res = await fetch(
				`${process.env.MOCKBIN_HOST}/bin/sample/${binId}`,
			);
			res.status.should.equal(200);
			const body = await res.json();
			// see file: ../../lib/routes/bins/sample.js
			body.should.have.property("cookies").eql([
				{ name: "foo", value: "bar" },
				{ name: "bar", value: "baz" },
			]);
			body.should.have.property("headers").eql([
				{
					name: "Accept",
					value: "application/json",
				},
				{
					name: "Content-Type",
					value: "application/x-www-form-urlencoded",
				},
			]);
			body.should.have.property("httpVersion").equal("HTTP/1.1");
		});
	});

	describe("/upsert", () => {
		it("should upsert a bin by existing id", async () => {
			const res = await fetch(
				`${process.env.MOCKBIN_HOST}/bin/upsert/${binId}`,
				{
					method: "PUT",
					body: JSON.stringify({
						status: 202,
						statusText: "Created",
						httpVersion: "HTTP/1.1",
						headers: [{ name: "Content-Type", value: "text/plain" }],
						cookies: [{ name: "foob", value: "barz" }],
						content: {
							size: 13,
							text: "Hello, you!",
							mimeType: "text/plain",
							compression: 0,
						},
						headersSize: -1,
						bodySize: -1,
					}),
				},
			);
			res.status.should.equal(200);

			const body = await res.text();
			body.should.equal(JSON.stringify(binId));

			const get = await fetch(`${process.env.MOCKBIN_HOST}/bin/view/${binId}`);
			const getBody = await get.json();
			getBody.should.have.property("status").equal(202);
			getBody.should.have.property("statusText").equal("Created");
			getBody.should.have
				.property("cookies")
				.eql([{ name: "foob", value: "barz" }]);
			getBody.should.have.property("httpVersion").equal("HTTP/1.1");
			getBody.should.have.property("content").match({
				text: "Hello, you!",
				mimeType: "text/plain",
			});
		});

		it("should upsert a bin by new id", async () => {
			const newId = uuidv4();
			const res = await fetch(
				`${process.env.MOCKBIN_HOST}/bin/upsert/${newId}`,
				{
					method: "PUT",
					body: JSON.stringify({
						status: 204,
						statusText: "No Content",
						httpVersion: "HTTP/1.1",
						cookies: [],
						headers: [],
						content: {
							size: 0,
							text: "",
							mimeType: "application/json",
							compression: 0,
						},
						redirectURL: "",
						headersSize: -1,
						bodySize: 0,
					}),
				},
			);
			res.status.should.equal(200);
			const body = await res.text();
			body.should.equal(JSON.stringify(newId));

			const get = await fetch(`${process.env.MOCKBIN_HOST}/bin/view/${newId}`);
			const getBody = await get.json();
			getBody.should.have.property("status").equal(204);
			getBody.should.have.property("statusText").equal("No Content");
			getBody.should.have.property("httpVersion").equal("HTTP/1.1");
			getBody.should.have.property("content").match({
				text: "",
				mimeType: "application/json",
			});
			getBody.should.have.property("headers").eql([]);
			getBody.should.have.property("cookies").eql([]);
			getBody.should.have.property("redirectURL").equal("");
			getBody.should.have.property("headersSize").equal(0);
			getBody.should.have.property("bodySize").equal(0);
		});
	});
});
