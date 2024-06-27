const cookieParser = require("cookie-parser");
const express = require("express");
const mockbin = require("../../lib");
const path = require("node:path");

const app = express();
app.enable("trust proxy");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "..", "..", "src", "views"));

app.use(cookieParser());

app.use("/", mockbin());
server = app.listen(3000);

require("should");

describe("HTTP", () => {
	after(() => {
    server.close();
  });
	it("home page responds with html content", async () => {
		const res = await fetch("http://localhost:3000/", {
			headers: {
				Accept: "text/html",
			},
		});

		res.status.should.equal(200);
		res.headers.get("content-type").should.equal("text/html; charset=utf-8");
	});

	it("should send CORS headers", async () => {
		const res = await fetch("http://localhost:3000/request", {
			method: "OPTIONS",
		});

		res.headers.get("access-control-allow-origin").should.equal("*");
		res.headers.get("access-control-allow-methods").should.equal("OPTIONS");
		res.headers
			.get("access-control-allow-headers")
			.should.equal(
				"host,connection,accept,accept-language,sec-fetch-mode,user-agent,accept-encoding",
			);
	});

	it("GET / responds with hello message", async () => {
		const res = await fetch("http://localhost:3000/", {
			headers: {
				Accept: "text/plain",
			},
		});

		res.headers.get("content-type").should.equal("text/plain; charset=utf-8");
		const body = await res.text();
		body.should.equal("Hello World!");
	});

	it("GET /ip should return local ip", async () => {
		const res = await fetch("http://localhost:3000/ip", {
			headers: {
				Accept: "text/plain",
			},
		});

		const body = await res.text();
		body.should.equal("::1");
	});

	it("GET /ips should return proxied IPs", async () => {
		const res = await fetch("http://localhost:3000/ips", {
			headers: {
				Accept: "application/json",
				"X-Forwarded-For": "10.10.10.1, 10.10.10.2, 10.10.10.3",
			},
		});

		const body = await res.json();
		body.should.be.an.Object();
		body.should.have.properties("10.10.10.1", "10.10.10.2", "10.10.10.3");
	});

	it("GET /agent should return user-agent string", async () => {
		const res = await fetch("http://localhost:3000/agent", {
			headers: {
				Accept: "text/plain",
				"User-Agent": "mockbin tester",
			},
		});

		const body = await res.text();
		body.should.equal("mockbin tester");
	});

	it("GET /status/:code should return custom status code", async () => {
		const res = await fetch("http://localhost:3000/status/900", {
			headers: {
				Accept: "application/json",
			},
		});

		res.status.should.equal(900);
		const body = await res.json();
		body.should.have.property("code").and.equal("900");
		body.should.have.property("message").and.equal("OK");
	});

	it("GET /status/:code/:reason should return custom status code + reason", async () => {
		const res = await fetch("http://localhost:3000/status/900/reason", {
			headers: {
				Accept: "application/json",
			},
		});

		res.status.should.equal(900);
		const body = await res.json();
		body.should.have.property("code").and.equal("900");
		body.should.have.property("message").and.equal("reason");
	});

	it("GET /status/:code/:reason should allow spaces in reason text", async () => {
		const res = await fetch(
			"http://localhost:3000/status/900/because of reasons",
			{
				headers: {
					Accept: "application/json",
				},
			},
		);

		res.status.should.equal(900);
		const body = await res.json();
		body.should.have.property("code").and.equal("900");
		body.should.have.property("message").and.equal("because of reasons");
	});

	it("GET /status/:code/:reason should replace plus signs in reason text with spaces", async () => {
		const res = await fetch(
			"http://localhost:3000/status/900/because+of+reasons",
			{
				headers: {
					Accept: "application/json",
				},
			},
		);

		res.status.should.equal(900);
		const body = await res.json();
		body.should.have.property("code").and.equal("900");
		body.should.have.property("message").and.equal("because of reasons");
	});

	it("GET /headers should return all headers", async () => {
		const res = await fetch("http://localhost:3000/headers", {
			headers: {
				Accept: "application/json",
				"X-Custom-Header": "ALL YOUR BASE ARE BELONG TO US",
			},
		});

		const body = await res.json();
		body.headers.should.containEql({
			name: "x-custom-header",
			value: "ALL YOUR BASE ARE BELONG TO US",
		});
	});

	it("GET /header/:name should return specific headers", async () => {
		const res = await fetch("http://localhost:3000/header/X-Custom-Header", {
			headers: {
				Accept: "application/json",
				"X-Custom-Header": "ALL YOUR BASE ARE BELONG TO US",
			},
		});

		const body = await res.json();
		body.should.equal("ALL YOUR BASE ARE BELONG TO US");
	});

	it("GET /cookies should return all cookies", async () => {
		const res = await fetch("http://localhost:3000/cookies", {
			headers: {
				Accept: "application/json",
				Cookie: "my-cookie=ALL YOUR BASE ARE BELONG TO US",
			},
		});

		const body = await res.json();
		body.should.containEql({
			name: "my-cookie",
			value: "ALL YOUR BASE ARE BELONG TO US",
		});
	});

	it("GET /cookie/:name should return specific cookie", async () => {
		const res = await fetch("http://localhost:3000/cookie/my-cookie", {
			headers: {
				Accept: "application/json",
				Cookie: "my-cookie=ALL YOUR BASE ARE BELONG TO US",
			},
		});

		const body = await res.text();
		body.should.containEql("ALL YOUR BASE ARE BELONG TO US");
	});

	it("POST /request should accept multipart/form-data requests", async () => {
		const number = "123";
		const res = await fetch("http://localhost:3000/request", {
			method: "POST",
			headers: {
				"content-type": "multipart/form-data; boundary=----boundary",
			},
			body: `------boundary\r\nContent-Disposition: form-data; name="number"\r\n\r\n${number}\r\n------boundary--\r\n`,
		});

		const body = await res.json();
		body.postData.params.number.should.equal(number);
	});

	it("GET /redirect/:status should redirect 1 time using :status", async () => {
		const res = await fetch("http://localhost:3000/redirect/303", {
			redirect: "follow",
			maxRedirects: 0,
			headers: {
				Accept: "application/json",
			},
		});

		const body = await res.json();
		body.should.equal("redirect finished");
	});

	it("GET /redirect/:status/:n should redirect :n times using :status", async () => {
		const res = await fetch("http://localhost:3000/redirect/302/3", {
			redirect: "follow",
			headers: {
				Accept: "application/json",
			},
		});

		const body = await res.json();
		body.should.equal("redirect finished");
	});

	it("GET /redirect/:status/:n should redirect :n times using :status (verify count)", async () => {
		const res = await fetch("http://localhost:3000/redirect/302/3", {
			redirect: "follow",
			maxRedirects: 2,
			headers: {
				Accept: "application/json",
			},
		});

		const body = await res.json();
		body.should.equal("redirect finished");
	});

	it("GET /redirect/:status?to=URL should redirect to URL", async () => {
		const res = await fetch(
			"http://localhost:3000/redirect/308?to=http://mockbin.com/",
			{
				redirect: "manual",
			},
		);

		res.status.should.equal(308);
		res.headers.get("location").should.equal("http://mockbin.com/");
	});
});
