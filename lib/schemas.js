module.exports = {
    mockSchema: {
        type: "object",
        required: [
            "status", "statusText", "httpVersion", "headers", 
            "cookies", "content", "headersSize", "bodySize", "redirectURL"
        ],
        additionalProperties: false,
        properties: {
            status: { type: "integer", minimum: 0 },
            statusText: { type: "string" },
            httpVersion: { type: "string" },
            headersSize: { type: "integer", minimum: 0 },
            bodySize: { type: "integer", minimum: 0 },
            redirectURL: { oneOf: [
                { type: "string", format: "uri-reference" }
            ]},			
            cookies: {
                type: "array",
                items: {
                    type: "object",
                    required: ["name", "value"],
                    additionalProperties: false,
                    properties: { 
                        name: { type: "string", format: "rHeaderValue" },
                        value: { type: "string", format: "rHeaderValue"},
                        expires: { type: "string", format: "rHeaderValue"},
                        domain: { type: "string" , format: "rHeaderValue"},
                        path: { type: "string" , format: "rHeaderValue"},
                        httpOnly: { type: "boolean" },
                        secure: { type: "boolean" }
                    }
                }
            },
            content: {
                type: "object",
                required: ["size", "mimeType", "text"],
                additionalProperties: false,
                properties: {
                    size: { type: "integer", minimum: 0},
                    mimeType: { type: "string" },
                    text: { type: "string" },
                    compression: { type: "integer" }
                }
            },
            headers: { 
                type: "array",
                items: {
                    type: "object",
                    required: ["id", "name", "value", "description", "disabled"],
                    additionalProperties: false,
                    properties: { 
                        id: { type: "string" },	
                        name: { 
                            type: "string", 
                            minLength: 1,
                            format: "rHeaderName",
                            not: {
                                pattern: "^(X-Accel-Redirect|X-Accel-Buffering|X-Accel-Charset|X-Accel-Limit-Rate)$" 
                            }
                            // https://nginx.org/en/docs/http/ngx_http_proxy_module.html
                            // X-Accel-Redirect		- Performs an internal redirect to the specified URI. 
                            // X-Accel-Buffering	- Enables or disables buffering of a response.
                            // X-Accel-Charset		- Sets the desired charset of a response.
                            // X-Accel-Expires 		- (not blocked) Set the parameters of response caching.
                            // X-Accel-Limit-Rate 	- Sets the rate limit for transmission of a response to a client.
                        },
                        value: { 
                            type: "string" ,
                            format: "rHeaderValue"
                        },
                        description: { type: "string" },
                        disabled: { type: "boolean" }
                    }
                }
            }
        }
    },
    
    // https://www.rfc-editor.org/rfc/rfc9110#section-5.5
    mockFormats: [
    {
      name: "rHeaderName", 
      format: /^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+$/ // INS-1977
    },
    {
      name: "rHeaderValue", 
      format: /^[a-zA-Z0-9!#$%&'*+\-.^_`|~\"\ (),/:;<=>?@\[\]{}]+$/
    }
  ],    
};