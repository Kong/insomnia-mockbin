const cookieParser = require("cookie-parser");
const express = require("express");
const mockbin = require("../../lib");
const path = require("node:path");

const app = express();
app.enable("trust proxy");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "..", "..", "src", "views"));

app.use(cookieParser());
app.use(
	"/static",
	express.static(path.join(__dirname, "..", "..", "src", "static")),
);

app.use("/", mockbin());

require("should");

describe("HTTP", () => {
	before(() => {
		server = app.listen(3000);
	});
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

	describe("front-end pages render", () => {
		it("GET / renders the home page", async () => {
			const res = await fetch("http://localhost:3000/", {
				headers: { Accept: "text/html" },
			});

			res.status.should.equal(200);
			res.headers.get("content-type").should.equal("text/html; charset=utf-8");
		});

		it("GET /har renders the clipboard + highlight page with its dependencies", async () => {
			const res = await fetch("http://localhost:3000/har", {
				headers: { Accept: "text/html" },
			});

			res.status.should.equal(200);
			res.headers.get("content-type").should.equal("text/html; charset=utf-8");

			const html = await res.text();
			html.should.containEql("btn-clipboard");
			html.should.containEql("nav-tabs");

			// the clipboard button's target must resolve to a real code element id,
			// not a leaked Pug interpolation literal like `#{key}-code`
			html.should.not.containEql("#{");
			for (const key of ["json", "yaml", "xml"]) {
				html.should.containEql(`data-clipboard-target="${key}-code"`);
				html.should.containEql(`id="${key}-code"`);
			}
		});

		it("serves the create.js static asset with its highlight wiring", async () => {
			const res = await fetch("http://localhost:3000/static/bin/create.js");

			res.status.should.equal(200);

			const js = await res.text();
			js.should.containEql("hljs.");
		});
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

	describe("front-end assets are patched", () => {
		// numeric semver-ish compare: gte("3.7.2", "3.5.0") === true
		const gte = (a, b) => {
			const pa = a.split(".").map(Number);
			const pb = b.split(".").map(Number);
			for (let i = 0; i < 3; i++) {
				if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
			}
			return true;
		};
		const versionOf = (html, re) => (html.match(re) || [])[1];

		let home;
		let har;

		before(async () => {
			home = await (
				await fetch("http://localhost:3000/", {
					headers: { Accept: "text/html" },
				})
			).text();
			har = await (
				await fetch("http://localhost:3000/har", {
					headers: { Accept: "text/html" },
				})
			).text();
		});

		it("contains no vulnerable or Flash-based references", () => {
			const blocklist = [
				"jquery/2.1.3",
				"twitter-bootstrap/3.3.4",
				"highlight.js/8.4",
				"zeroclipboard",
				"ZeroClipboard",
				".swf",
				"highlightBlock",
			];

			for (const bad of blocklist) {
				home.should.not.containEql(bad);
				har.should.not.containEql(bad);
			}
		});

		it("loads library versions at or above the patched floor", () => {
			gte(
				versionOf(home, /jquery\/(\d+\.\d+\.\d+)\//),
				"3.5.0",
			).should.be.true();
			gte(
				versionOf(home, /twitter-bootstrap\/(\d+\.\d+\.\d+)\//),
				"3.4.1",
			).should.be.true();
			gte(
				versionOf(home, /highlight\.js\/(\d+\.\d+\.\d+)\//),
				"10.0.0",
			).should.be.true();
		});

		it("uses the native Clipboard API for copy-to-clipboard", () => {
			har.should.containEql("navigator.clipboard");
			har.should.containEql("btn-clipboard");
		});
	});
});
