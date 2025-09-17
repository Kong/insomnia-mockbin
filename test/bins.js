/* global describe, it */

require("should");

const createRoute = require("../lib/routes/bins/create");
const viewRoute = require("../lib/routes/bins/view");
const updateRoute = require("../lib/routes/bins/update");
const deleteRoute = require("../lib/routes/bins/delete");
const runRoute = require("../lib/routes/bins/run");
const logRoute = require("../lib/routes/bins/log");
const formRoute = require("../lib/routes/bins/form");
const sampleRoute = require("../lib/routes/bins/sample");

describe("bins", () => {
	describe("create route", () => {
		it("should create a bin with valid HAR response", (done) => {
			console.log("starting");
			const mockClient = {
				set: (key, value, ex, expire, callback) => {
					console.log("setting");
					key.should.match(/^bin:[a-f0-9-]{36}$/);
					const parsedValue = JSON.parse(value);
					parsedValue.status.should.equal(200);
					parsedValue.content.text.should.equal("Hello World");
					if (callback) callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
				jsonBody: {
					status: 200,
					statusText: "OK",
					httpVersion: "HTTP/1.1",
					headers: [],
					cookies: [],
					content: {
						text: "Hello World",
						mimeType: "text/plain",
					},
				},
				simple: { postData: { params: {}, text: "" } },
			};

			const res = {
				status: function (code) {
					code.should.equal(201);
					return this;
				},
				location: function (loc) {
					loc.should.match(/^\/bin\/[a-f0-9-]{36}$/);
					return this;
				},
				view: null,
				body: null,
			};

			console.log("routing");
			const route = createRoute(mockClient);
			route(req, res, () => {
				res.body.should.match(/^[a-f0-9-]{36}$/);
				done();
			});
		});

		it("should handle nested response object", (done) => {
			const mockClient = {
				set: (key, value, ex, expire, callback) => {
					const parsedValue = JSON.parse(value);
					parsedValue.status.should.equal(201);
					parsedValue.statusText.should.equal("Created");
					callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
				jsonBody: {
					response: {
						status: 201,
						statusText: "Created",
						httpVersion: "HTTP/1.1",
						headers: [],
						cookies: [],
						content: {
							text: "Created",
							mimeType: "text/plain",
						},
					},
				},
				simple: { postData: { params: {}, text: "" } },
			};

			const res = {
				status: () => res,
				location: () => res,
				view: null,
				body: null,
			};

			const route = createRoute(mockClient);
			route(req, res, () => {
				done();
			});
		});

		it("should handle invalid JSON gracefully", (done) => {
			const mockClient = {};
			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
				jsonBody: {},
				simple: { postData: { params: {}, text: "invalid json" } },
			};

			const res = { body: null };

			const route = createRoute(mockClient);
			route(req, res, () => {
				res.body.should.have.property("error");
				done();
			});
		});
	});

	describe("view route", () => {
		it("should view a bin without insomnia-mock-method header", (done) => {
			const mockBin = { status: 200, content: { text: "Hello" } };
			const mockClient = {
				get: (key, callback) => {
					key.should.equal("bin:test-uuid/test/path");
					if (callback) callback(null, JSON.stringify(mockBin));
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
			};

			const res = { view: null, body: null };

			const route = viewRoute(mockClient);
			route(req, res, () => {
				res.view.should.equal("bin/view");
				res.body.should.eql(mockBin);
				done();
			});
		});

		it("should view a bin with insomnia-mock-method header", (done) => {
			const mockBin = { status: 201, content: { text: "Created" } };
			const mockClient = {
				get: (key, callback) => {
					key.should.equal("bin:test-uuid/test/pathPOST");
					if (callback) callback(null, JSON.stringify(mockBin));
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: { "insomnia-mock-method": "POST" },
			};

			const res = { view: null, body: null };

			const route = viewRoute(mockClient);
			route(req, res, () => {
				res.view.should.equal("bin/view");
				res.body.should.eql(mockBin);
				done();
			});
		});

		it("should handle non-existent bin", (done) => {
			const mockClient = {
				get: (key, callback) => {
					callback(null, null);
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
			};

			const res = { view: null, body: null };

			const route = viewRoute(mockClient);
			route(req, res, () => {
				should(res.view).be.null();
				should(res.body).be.null();
				done();
			});
		});

		it("should reject invalid insomnia-mock-method", (done) => {
			const mockClient = {};
			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: { "insomnia-mock-method": "INVALID" },
			};

			const res = {};
			const next = () => {};

			const route = viewRoute(mockClient);
			(() => route(req, res, next)).should.throw(
				"Invalid request method: INVALID",
			);
			done();
		});
	});

	describe("update route", () => {
		it("should update a bin without insomnia-mock-method header", (done) => {
			let setCalls = 0;
			const mockClient = {
				set: (key, value, ex, expire, callback) => {
					setCalls++;
					if (setCalls === 1) {
						key.should.equal("bin:test-uuid/test/path");
					} else {
						key.should.equal("bin:test-uuid/test/path");
					}
					if (callback) callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
				jsonBody: {
					status: 200,
					statusText: "OK",
					httpVersion: "HTTP/1.1",
					headers: [],
					cookies: [],
					content: {
						text: "Updated",
						mimeType: "text/plain",
					},
				},
				simple: { postData: { text: "" } },
			};

			const res = {
				status: (code) => {
					code.should.equal(200);
					return res;
				},
				location: () => res,
				view: null,
				body: null,
			};

			const route = updateRoute(mockClient);
			route(req, res, () => {
				setCalls.should.equal(2);
				done();
			});
		});

		it("should update a bin with insomnia-mock-method header", (done) => {
			let setCalls = 0;
			const mockClient = {
				set: (key, value, ex, expire, callback) => {
					setCalls++;
					if (setCalls === 1) {
						key.should.equal("bin:test-uuid/test/pathPUT");
					} else {
						key.should.equal("bin:test-uuid/test/path");
					}
					if (callback) callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: { "insomnia-mock-method": "PUT" },
				jsonBody: {
					status: 200,
					statusText: "OK",
					httpVersion: "HTTP/1.1",
					headers: [],
					cookies: [],
					content: {
						text: "Updated via PUT",
						mimeType: "text/plain",
					},
				},
				simple: { postData: { text: "" } },
			};

			const res = {
				status: () => res,
				location: () => res,
				view: null,
				body: null,
			};

			const route = updateRoute(mockClient);
			route(req, res, () => {
				setCalls.should.equal(2);
				done();
			});
		});

		it("should handle missing request body", (done) => {
			const mockClient = {};
			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
				jsonBody: null,
				simple: { postData: { text: "" } },
			};

			const res = { body: null };

			const route = updateRoute(mockClient);
			route(req, res, () => {
				res.body.should.have.property("error", "Response body is required");
				res.body.should.have.property(
					"message",
					'The "response" field is required',
				);
				done();
			});
		});
	});

	describe("delete route", () => {
		it("should delete a bin without insomnia-mock-method header", (done) => {
			let delCalls = 0;
			const mockClient = {
				del: (key, callback) => {
					delCalls++;
					if (delCalls === 1) {
						key.should.equal("bin:test-uuid/test/path");
					} else {
						key.should.equal("log:test-uuid/test/path");
					}
					if (callback) callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
			};

			const res = {};
			let nextCalls = 0;
			const next = () => {
				nextCalls++;
				if (nextCalls === 2) {
					delCalls.should.equal(2);
					done();
				}
			};

			const route = deleteRoute(mockClient);
			route(req, res, next);
		});

		it("should delete a bin with insomnia-mock-method header", (done) => {
			let delCalls = 0;
			const mockClient = {
				del: (key, callback) => {
					delCalls++;
					if (delCalls === 1) {
						key.should.equal("bin:test-uuid/test/pathDELETE");
					} else {
						key.should.equal("log:test-uuid/test/pathDELETE");
					}
					if (callback) callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: { "insomnia-mock-method": "DELETE" },
			};

			const res = {};
			let nextCalls = 0;
			const next = () => {
				nextCalls++;
				if (nextCalls === 2) {
					delCalls.should.equal(2);
					done();
				}
			};

			const route = deleteRoute(mockClient);
			route(req, res, next);
		});
	});

	describe("run route", () => {
		it("should run method-specific mock first", (done) => {
			const mockResponse = {
				status: 200,
				content: { text: "Method-specific response" },
				headers: [],
				cookies: [],
				httpVersion: "HTTP/1.1",
				redirectURL: "",
			};

			let getCalls = 0;

			const mockClient = {
				get: (key, callback) => {
					getCalls++;
					if (getCalls === 1) {
						key.should.equal("bin:test-uuid/test/pathGET");
						if (callback) callback(null, null);
					}
					if (getCalls === 2) {
						key.should.equal("bin:test-uuid/test/path");
						if (callback) callback(null, JSON.stringify(mockResponse));
					}
				},
				rpush: (key, value, callback) => {
					if (getCalls === 1) {
						key.should.equal("log:test-uuid/test/pathGET");
					}
					if (getCalls === 2) {
						key.should.equal("log:test-uuid/test/path");
					}
					if (callback) callback();
				},
				ltrim: (key, start, end, callback) => {
					if (getCalls === 1) {
						key.should.equal("log:test-uuid/test/pathGET");
					}
					if (getCalls === 2) {
						key.should.equal("log:test-uuid/test/path");
					}
					if (callback) callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				har: {
					log: {
						entries: [],
					},
				},
				method: "GET",
			};

			const res = {
				send: () => {},
			};

			const route = runRoute(mockClient);
			route(req, res, () => {
				done();
			});
		});

		it("should fallback to legacy mock when method-specific not found", (done) => {
			const mockResponse = {
				status: 200,
				content: { text: "Legacy response" },
				headers: [],
				cookies: [],
				httpVersion: "HTTP/1.1",
				redirectURL: "",
			};

			let getCalls = 0;
			const mockClient = {
				get: (key, callback) => {
					getCalls++;
					if (getCalls === 1) {
						key.should.equal("bin:test-uuid/test/pathGET");
						if (callback) callback(null, null);
					} else {
						key.should.equal("bin:test-uuid/test/path");
						if (callback) callback(null, JSON.stringify(mockResponse));
					}
				},
				rpush: (key, value, callback) => {
					key.should.equal("log:test-uuid/test/path");
					if (callback) callback();
				},
				ltrim: (key, start, end, callback) => {
					key.should.equal("log:test-uuid/test/path");
					if (callback) callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				har: {
					log: {
						entries: [],
					},
				},
				method: "GET",
			};

			const res = {
				send: () => {},
			};

			const route = runRoute(mockClient);
			route(req, res, () => {
				getCalls.should.equal(2);
				done();
			});
		});
	});

	describe("log route", () => {
		it("should get log without insomnia-mock-method header", (done) => {
			const mockClient = {
				lrange: (key, start, end, callback) => {
					key.should.equal("log:test-uuid/test/path");
					start.should.equal(0);
					end.should.equal(-1);
					callback(null, []);
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: {},
			};

			const res = { view: null, body: null };

			const route = logRoute(mockClient);
			route(req, res, () => {
				res.view.should.equal("bin/log");
				res.body.should.have.property("log");
				res.body.log.should.have.property("version", "1.2");
				res.body.log.should.have.property("entries").eql([]);
				done();
			});
		});

		it("should get log with insomnia-mock-method header", (done) => {
			const mockEntries = ['{"method": "POST", "url": "test"}'];
			const mockClient = {
				lrange: (key, start, end, callback) => {
					key.should.equal("log:test-uuid/test/pathPOST");
					callback(null, mockEntries);
				},
			};

			const req = {
				params: { uuid: "test-uuid", 0: "/test/path" },
				headers: { "insomnia-mock-method": "POST" },
			};

			const res = { view: null, body: null };

			const route = logRoute(mockClient);
			route(req, res, () => {
				res.body.log.entries.should.have.length(1);
				res.body.log.entries[0].should.eql({ method: "POST", url: "test" });
				done();
			});
		});
	});

	describe("form route", () => {
		it("should set view to bin/create", (done) => {
			const req = {};
			const res = { view: null };

			formRoute(req, res, () => {
				res.view.should.equal("bin/create");
				done();
			});
		});
	});

	describe("sample route", () => {
		it("should return sample HAR data", (done) => {
			const mockResponse = {
				status: 200,
				content: { text: "Sample HAR data" },
				headers: [],
				cookies: [],
				httpVersion: "HTTP/1.1",
				redirectURL: "",
			};

			const mockClient = {
				get: (key, callback) => {
					key.should.equal("bin:test-uuid");
					callback(null, JSON.stringify(mockResponse));
				},
				rpush: (key, value, callback) => {
					key.should.equal("log:test-uuid");
					callback();
				},
				ltrim: (key, start, end, callback) => {
					key.should.equal("log:test-uuid");
					callback();
				},
			};

			const req = {
				params: { uuid: "test-uuid" },
				protocol: "http",
				hostname: "mockbin.org",
			};
			const res = {
				body: null,
				json: (obj) => {
					obj.should.have.property("method", "POST");
					obj.should.have.property("url", "http://mockbin.org/bin/test-uuid");
					obj.should.have.property("httpVersion", "HTTP/1.1");
					obj.should.have.property("cookies");
					obj.cookies.should.containEql({ name: "foo", value: "bar" });
					obj.should.have.property("headers");
					obj.headers.should.containEql({
						name: "Accept",
						value: "application/json",
					});
					obj.should.have.property("postData");
					obj.postData.should.have.property(
						"mimeType",
						"application/x-www-form-urlencoded",
					);
					obj.postData.should.have.property("params");
					obj.postData.params.should.containEql({ name: "foo", value: "bar" });
					done();
				},
			};

			sampleRoute(mockClient)(req, res, () => {});
		});
	});
});
