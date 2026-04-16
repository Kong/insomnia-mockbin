module.exports = {
	mockSchema: {
		type: "object",
		required: [
			"status",
			"statusText",
			"httpVersion",
			"headers",
			"cookies",
			"content",
			"headersSize",
			"bodySize",
			"redirectURL",
		],
		additionalProperties: false,
		properties: {
			status: {
				type: "integer",
				// Removed informational (1xx) response (https://datatracker.ietf.org/doc/html/rfc7231#section-6.2).
				minimum: 200,
				maximum: 999,
				default: 200,
				errorMessage:
					"The 'status' property must be between 200 - 999 and of type integer.",
			},
			statusText: {
				type: "string",
				default: "Ok",
				format: "rHeaderValue",
				errorMessage:
					"The 'statusText' property contains characters that are invalid for an HTTP Reason Phrase value (see RFC 9110).",
			},
			httpVersion: {
				type: "string",
				enum: [
					"HTTP/1.0",
					"HTTP/1.1",
					"HTTP/2",
					"HTTP/3", // Do we want this available on cloud?
				],
				errorMessage:
					"The 'httpVersion' property must be a valid HTTP version (e.g., HTTP/1.0, HTTP/1.1, HTTP/2).",
				default: "HTTP/2",
			},
			headersSize: {
				type: "integer",
				minimum: -1,
				default: -1,
				errorMessage:
					"The 'headersSize' property must be >= 0 and of type integer.",
			},
			bodySize: {
				type: "integer",
				minimum: -1,
				default: -1,
				errorMessage:
					"The 'bodySize' property must be >= 0 and of type integer.",
			},
			redirectURL: {
				type: "string",
				format: "uri-reference",
				default: "",
				errorMessage:
					"The 'redirectURL' property must a valid absolute URI or relative reference.",
			},
			cookies: {
				type: "array",
				items: {
					type: "object",
					required: ["name", "value"],
					additionalProperties: false,
					properties: {
						name: {
							type: "string",
							format: "rHeaderValue",
							errorMessage:
								"The 'name' property contains characters that are invalid for an HTTP field name (see RFC 9110).",
						},
						value: {
							oneOf: [
								{ const: "" },
								{
									type: "string",
									format: "rHeaderValue",
									errorMessage:
										"The 'value' property contains characters that are invalid for an HTTP field value (see RFC 9110).",
								},
							],
						},
						expires: {
							oneOf: [
								{ const: "" },
								{
									type: "string",
									format: "rHeaderValue",
									errorMessage:
										"The 'value' property contains characters that are invalid for an HTTP field value (see RFC 9110).",
								},
							],
						},
						domain: {
							oneOf: [
								{ const: "" },
								{
									type: "string",
									format: "rHeaderValue",
									errorMessage:
										"The 'value' property contains characters that are invalid for an HTTP field value (see RFC 9110).",
								},
							],
						},
						path: {
							oneOf: [
								{ const: "" },
								{
									type: "string",
									format: "rHeaderValue",
									errorMessage:
										"The 'value' property contains characters that are invalid for an HTTP field value (see RFC 9110).",
								},
							],
						},
						httpOnly: {
							type: "boolean",
							errorMessage: "The 'httpOnly' property must be of type boolean",
						},
						secure: {
							type: "boolean",
							errorMessage: "The 'secure' property must be of type boolean",
						},
					},
				},
			},
			content: {
				type: "object",
				required: ["size", "mimeType", "text", "compression"],
				additionalProperties: false,
				properties: {
					size: {
						type: "integer",
						minimum: 0,
						default: 0,
						errorMessage:
							"The 'size' property must be >= 0 and of type integer.",
					},
					mimeType: {
						type: "string",
						maxLength: 512,
						default: "",
						errorMessage:
							"The 'mimeType' property can not exceed 512 characters and must be of type string.",
					},
					text: {
						type: "string",
						default: "",
						errorMessage: "The 'text' property must be of type string.",
					},
					compression: {
						type: "integer",
						default: 0,
						errorMessage: "The 'compression' property must of type integer.",
					},
				},
			},
			headers: {
				type: "array",
				items: {
					type: "object",
					required: ["name", "value"],
					additionalProperties: false,
					properties: {
						id: {
							type: "string",
							errorMessage: "The 'id' property must be of type string.",
						},
						name: {
							type: "string",
							minLength: 1,
							format: "rHeaderName",
							not: {
								pattern:
									"^(X-Accel-Redirect|X-Accel-Buffering|X-Accel-Charset|X-Accel-Limit-Rate)$",
							},
							// https://nginx.org/en/docs/http/ngx_http_proxy_module.html
							// X-Accel-Redirect		- Performs an internal redirect to the specified URI.
							// X-Accel-Buffering	- Enables or disables buffering of a response.
							// X-Accel-Charset		- Sets the desired charset of a response.
							// X-Accel-Expires 		- (not blocked) Set the parameters of response caching.
							// X-Accel-Limit-Rate 	- Sets the rate limit for transmission of a response to a client.
							errorMessage:
								"The 'name' property contains characters that are invalid for an HTTP field value (see RFC 9110).",
						},
						value: {
							oneOf: [
								{ const: "" },
								{
									type: "string",
									format: "rHeaderValue",
									errorMessage:
										"The 'value' property contains characters that are invalid for an HTTP field value (see RFC 9110).",
								},
							],
						},
						description: {
							type: "string",
							errorMessage:
								"The 'description' property must be of type string.",
						},
						disabled: {
							type: "boolean",
							errorMessage: "The 'disabled' property must be of type boolean.",
						},
					},
				},
			},
		},
	},

	// https://www.rfc-editor.org/rfc/rfc9110#section-5.5
	mockFormats: [
		{
			name: "rHeaderName",
			format: /^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+$/, // INS-1977
		},
		{
			name: "rHeaderValue",
			format: /^[a-zA-Z0-9!#$%&'*+\-.^_`|~\"\ (),/:;<=>?@\[\]{}]+$/,
		},
	],
};
