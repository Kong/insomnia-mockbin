## API Endpoints

### Bins

#### Create Bin

> ##### `POST /bin/create/view`

Creates a new **Bin** with a mock HTTP response as described by a [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) body.

Responds with a `Location` header with the newly created **Bin**, e.g. `Location: http://mockbin.org/bin/3c149e20-bc9c-4c68-8614-048e6023a108` *(also repeated in the body)*

- The [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) sent at time of creation will determine what the response status, headers, content will be
- You can request the new Bin with *any* combination of the following:
  - HTTP methods *(e.g. `POST`, `XXPUT`)*
  - HTTP headers *(e.g. `X-My-Header-Name: Value`)*
  - body content *(max of 100mb)*
  - query string *(e.g. `?foo=bar`)*
  - path arguments *(e.g. `/bin/3c149e20-bc9c-4c68-8614-048e6023a108/any/extra/path/`)*
- All requests to Bin will be [logged](#view-logs) for later inspection *(max of 100 requests)*

###### Request

> ```http
> POST /bin/create HTTP/1.1
> Host: mockbin.org
> Content-Type: application/json
> Accept: application/json
> Content-Length: 819
>
> {
>   "status": 200,
>   "statusText": "OK",
>   "httpVersion": "HTTP/1.1",
>   "headers": [
>     {
>       "name": "Date",
>       "value": "Wed, 21 Jan 2015 23:36:35 GMT"
>     },
>     {
>       "name": "Server",
>       "value": "Apache"
>     },
>     {
>       "name": "Transfer-Encoding",
>       "value": "chunked"
>     },
>     {
>       "name": "Content-Type",
>       "value": "text/html; charset=UTF-8"
>     },
>     {
>       "name": "Cache-Control",
>       "value": "max-age=7200"
>     },
>     {
>       "name": "Connection",
>       "value": "Keep-Alive"
>     },
>     {
>       "name": "Keep-Alive",
>       "value": "timeout=5, max=50"
>     },
>     {
>       "name": "Expires",
>       "value": "Thu, 22 Jan 2015 01:36:35 GMT"
>     }
>   ],
>   "cookies": [],
>   "content": {
>     "size": 70972,
>     "mimeType": "text/html",
>     "compression": -21
>   },
>   "redirectURL": "",
>   "headersSize": 323,
>   "bodySize": 70993
> }
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Location: http://mockbin.org/3c149e20-bc9c-4c68-8614-048e6023a108
> Content-Type: application/json; charset=utf-8
> Content-Length: 38
>
> "3c149e20-bc9c-4c68-8614-048e6023a108"
> ```

----

#### Inspect Bin

> ##### `GET /bin/:id/view`

Respondes with the [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) sent at time of [creation](#create-bin).

###### Request

> ```http
> GET /bin/3c149e20-bc9c-4c68-8614-048e6023a108/view HTTP/1.1
> Host: mockbin.org
> Accept: application/json
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> Content-Length: 70993
> 
> {
>     "bodySize": 70993, 
>     "content": {
>         "compression": 0, 
>         "mimeType": "text/html", 
>         "size": 20, 
>         "text": "<h1>Hello World</h1>"
>     }, 
>     "cookies": [], 
>     "headers": [
>         {
>             "name": "Date", 
>             "value": "Wed, 21 Jan 2015 23:36:35 GMT"
>         }, 
>         {
>             "name": "Server", 
>             "value": "Apache"
>         }, 
>         {
>             "name": "Transfer-Encoding", 
>             "value": "chunked"
>         }, 
>         {
>             "name": "Content-Type", 
>             "value": "text/html; charset=UTF-8"
>         }, 
>         {
>             "name": "Cache-Control", 
>             "value": "max-age=7200"
>         }, 
>         {
>             "name": "Connection", 
>             "value": "Keep-Alive"
>         }, 
>         {
>             "name": "Keep-Alive", 
>             "value": "timeout=5, max=50"
>         }, 
>         {
>             "name": "Expires", 
>             "value": "Thu, 22 Jan 2015 01:36:35 GMT"
>         }
>     ], 
>     "headersSize": 323, 
>     "httpVersion": "HTTP/1.1", 
>     "redirectURL": "", 
>     "status": 200, 
>     "statusText": "OK"
> }
> ```

#### Request Bin

> ##### `* /bin/:id`

The [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) sent at time of [creation](#create-bin) will determine what the response status, headers, content will be.

Each call to this endpoint will be [logged](#bin-log) *(max of 100 requests)*.

You can request this endpoint with *any* combination of the following:
  - HTTP methods *(e.g. `POST`, `XXPUT`)*
  - HTTP headers *(e.g. `X-My-Header-Name: Value`)*
  - body content *(max of 100mb)*
  - query string *(e.g. `?foo=bar`)*
  - path arguments *(e.g. `/bin/3c149e20-bc9c-4c68-8614-048e6023a108/any/extra/path/`)*

###### Request

> ```http
> GET /bin/3c149e20-bc9c-4c68-8614-048e6023a108/view HTTP/1.1
> Host: mockbin.org
> Accept: application/json
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Cache-Control: max-age=7200
> Connection: keep-alive
> Content-Encoding: gzip
> Content-Type: text/html; charset=utf-8
> Date: Thu, 05 Mar 2015 18:09:40 GMT
> Expires: Thu, 22 Jan 2015 01:36:35 GMT
> Server: Apache
> Transfer-Encoding: chunked

> <h1>Hello World</h1>
> ```

#### Bin Access Log

> ##### `GET /bin/:id/log`

List all requests made to this Bin, using [HAR](http://www.softwareishard.com/blog/har-12-spec/) log format.

###### Request

> ```http
> GET /bin/3c149e20-bc9c-4c68-8614-048e6023a108/log HTTP/1.1
> Host: mockbin.org
> Accept: application/json
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 12
>
> "log": {
>   "creator": {
>       "name": "mockbin.org", 
>       "version": "1.0.1"
>   }, 
>   "entries": [
>       ...
>   ]
> }
> ```

----

### IP

#### Origin IP

> ##### `GET /ip`

Returns Origin IP.

###### Request

> ```http
> GET /ip HTTP/1.1
> Host: mockbin.org
> Accept: application/json
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 12
>
> "10.10.10.1"
> ```

----

#### Proxied IPs

> ##### `GET /ips`

Parses the "X-Forwarded-For" ip address list and return an array. Otherwise, an empty array is returned.

###### Request

> ```http
> GET /ips HTTP/1.1
> Host: mockbin.org
> Accept: application/json
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 42
>
> ["10.10.10.1", "10.10.10.2", "10.10.10.3"]
> ```

----

### Status

#### Custom Status

> ##### `GET /status/:code/:reason`

Returns a response with the given HTTP Status code and message in status line and body.

| Parameter | Type   | Required | Default |
| --------- | ------ | -------- | ------- |
| `:code`   | Number | yes      | `200`   |
| `:reason` | String | no       | `OK`    |

###### Request

> ```http
> GET /status/20/Hello HTTP/1.1
> Host: mockbin.org
>
> ```

###### Response

> ```http
> HTTP/1.1 20 Hello
> Content-Type: text/html; charset=utf-8
> Content-Length: 38
>
> {
>   "code": 20,
>   "message": "Hello"
> }
> ```

----

### Headers

#### List Request Headers

> ##### `GET /headers`

Returns list of all headers used in request as well as total number of bytes from the start of the HTTP request message until (and including) the double CRLF before the body.

###### Request

> ```http
> GET /headers HTTP/1.1
> Host: mockbin.org
> X-Custom-Header: Foo
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 306
>
> {
>   "headers": [
>     {
>       "name": "x-custom-header",
>       "value": "Foo"
>     },
>     {
>       "name": "accept",
>       "value": "*/*"
>     },
>     {
>       "name": "host",
>       "value": "mockbin.org"
>     }
>   ],
>   "headersSize": 124
> }
> ```

#### Single Header Value

> ##### `GET /header/:name`

Returns the value of header with the name `:name`

| Parameter | Type   | Required |
| --------- | ------ | -------- |
| `:name`   | String | yes      |

###### Request

> ```http
> GET /header/x-custom-header HTTP/1.1
> Host: mockbin.org
> X-Custom-Header: Foo
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 5
>
> "Foo"
> ```

#### User Agent

> ##### `GET /agent`

Returns user-agent.

###### Request

> ```http
> GET /agent HTTP/1.1
> Host: mockbin.org
> User-Agent: curl/7.35.0
> Accept: application/json
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 13
>
> "curl/7.35.0"
> ```

----

### Cookies

#### List All Cookies

> ##### `GET /cookies`

Returns list of all cookies sent by the client

###### Request

> ```http
> GET /cookies HTTP/1.1
> Host: mockbin.org
> Cookie: my-cookie=ALL YOUR BASE ARE BELONG TO US; foo=bar
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 129
>
> [
>   {
>     "name": "my-cookie",
>     "value": "ALL YOUR BASE ARE BELONG TO US"
>   },
>   {
>     "name": "foo",
>     "value": "bar"
>   }
> ]
> ```

----

#### Single Cookie Value

> ##### `GET /cookie/:name`

Returns the value of the cookie with the name `:name`

| Parameter | Type   | Required |
| --------- | ------ | -------- |
| `:name`   | String | yes      |

###### Request

> ```http
> GET /header/my-cookie HTTP/1.1
> Host: mockbin.org
> Cookie: my-cookie=ALL YOUR BASE ARE BELONG TO US; foo=bar
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 32
>
> "ALL YOUR BASE ARE BELONG TO US"
> ```

----

### Redirects

#### Custom Redirect Loop

> ##### `/redirect/:status/:count/?to=:url`

Start a redirects loop using the redirect custom status code: `status`, looping through the url pattern: `/redirect/:status/[:count -1]` eventually landing on `:url` *(or `/redirect/:status/0` if no `url` was provided)*

###### Parameters

| Parameter | Type   | Required | Default | Note                                                                                                         |
| --------- | ------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `:status` | Number | no       | `302`   | must be a valid [3xx redirection](http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml) |
| `:count`  | Number | no       | `0`     | amount of redirect loops to go through                                                                       |
| `?to`     | String | no       | `null`  | URL or Path to redirect to                                                                                   |


#### Redirect Status

> ##### `GET /redirect/:status`

###### Request

> ```http
> GET /redirect/308 HTTP/1.1
> Host: mockbin.org
>
> ```

###### Response

> ```http
> HTTP/1.1 308 Permanent Redirect
> Location: http://localhost:80/redirect/0
> Content-Type: text/plain; charset=utf-8
> Content-Length: 65
> 
> Permanent Redirect. Redirecting to http://localhost:80/redirect/0
> ```

#### Redirect To Url

> ##### `GET /redirect/:status?to=:url`

###### Request

> ```http
> GET /redirect/308?to=https://www.mashape.com/ HTTP/1.1
> Host: mockbin.org
>
> ```

###### Response

> ```http
> HTTP/1.1 308 Permanent Redirect
> Location: https://www.mashape.com/
> Content-Type: text/plain; charset=utf-8
> Content-Length: 59
> 

> Permanent Redirect. Redirecting to https://www.mashape.com/
> ```

#### Redirect Loop

> ##### `GET /redirect/:status/:count`

###### Request

> ```http
> GET /redirect/308/3 HTTP/1.1
> Host: mockbin.org
>
> ```

###### Response

> ```http
> HTTP/1.1 308 Permanent Redirect
> Location: http://localhost:80/redirect/2
> Content-Type: text/plain; charset=utf-8
> Content-Length: 65
> 

> Permanent Redirect. Redirecting to http://localhost:80/redirect/3
> ```

> ```http
> HTTP/1.1 308 Permanent Redirect
> Location: http://localhost:80/redirect/1
> Content-Type: text/plain; charset=utf-8
> Content-Length: 65
> 

> Permanent Redirect. Redirecting to http://localhost:80/redirect/1
> ```

> ```http
> HTTP/1.1 308 Permanent Redirect
> Location: http://localhost:80/redirect/0
> Content-Type: text/plain; charset=utf-8
> Content-Length: 65
> 

> Permanent Redirect. Redirecting to http://localhost:80/redirect/0
> ```

> ```http
> HTTP/1.1 200 OK
> Content-Type: text/plain; charset=utf-8
> Content-Length: 17
> 
> redirect finished 
> ```

----

### Stream

#### Stream output

> ##### `GET /stream/:chunks`

Streams a chunked response, defaults to 10 chunks with an upper limit of 100

###### Request

> ```http
> GET /stream/4 HTTP/1.1
> Host: mockbin.org
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: text/plain
> Transfer-Encoding: chunked
> Connection: keep-alive
>
> {"type":"stream","chunk":1}
> {"type":"stream","chunk":2}
> {"type":"stream","chunk":3}
> ```

----

### Delay

#### Delayed Response

> ##### `GET /delay/:ms`

Returns a response after a delay in milliseconds, default is 200ms

###### Request

> ```http
> GET /delay/5000 HTTP/1.1
> Host: mockbin.org
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Length: 21
>
> {
>   "delay": "5000"
> }
> ```

----

### Debugging

#### Echo 

> ##### `POST /echo`

Returns a response with identical `Body` and `Content-Type` to what's in teh request.

###### Request

> ```http
> POST /echo HTTP/1.1
> Host: mockbin.org
> Content-Type: application/json
> Content-Length: 14
>
> {"foo": "bar"}
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 14
>
> {"foo": "bar"}
> ```

#### HTTP Request

> ##### `* /request/:path?`

Returns back all the info sent through your request in [HAR Request Obejct](http://www.softwareishard.com/blog/har-12-spec/#request) format.

###### Request

> ```http
> POST /request/any/path?foo=bar&foo=baz&key=value HTTP/1.1
> Host: mockbin.org
> Cookie: Greet=Hello;World=Universe
> X-Custom-Header: Foo
> Accept: application/json
> Content-Length: 7
> Content-Type: application/x-www-form-urlencoded
>
> foo=bar
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 1330
>
> {
>   "request": {
>     "method": "POST",
>     "url": "http://localhost/request/any/path?foo=bar&foo=baz&key=value",
>     "httpVersion": "HTTP/1.1",
>     "cookies": [
>       {
>         "name": "World",
>         "value": "Universe"
>       },
>       {
>         "name": "Greet",
>         "value": "Hello"
>       }
>     ],
>     "headers": [
>       {
>         "name": "content-type",
>         "value": "application/x-www-form-urlencoded"
>       },
>       {
>         "name": "content-length",
>         "value": "7"
>       },
>       {
>         "name": "accept",
>         "value": "application/json"
>       },
>       {
>         "name": "x-custom-header",
>         "value": "Foo"
>       },
>       {
>         "name": "cookie",
>         "value": "Greet=Hello;World=Universe"
>       },
>       {
>         "name": "host",
>         "value": "localhost:3000"
>       }
>     ],
>     "queryString": [
>       {
>         "name": "key",
>         "value": "value"
>       },
>       {
>         "name": "foo",
>         "value": [
>           "bar",
>           "baz"
>         ]
>       }
>     ],
>     "postData": {
>       "mimeType": "application/x-www-form-urlencoded",
>       "text": "foo=bar",
>       "params": [
>         {
>           "name": "foo",
>           "value": "bar"
>         }
>       ]
>     },
>     "headersSize": 267,
>     "bodySize": 7
>   }
> }
> ```

#### HTTP Archive

> ##### `* /har/:path?`

Returns back all the info sent through your request in [HAR Obejct](http://www.softwareishard.com/blog/har-12-spec/) format.

###### Request

> ```http
> POST /har/any/path?foo=bar&foo=baz&key=value HTTP/1.1
> Host: mockbin.org
> Cookie: Greet=Hello;World=Universe
> X-Custom-Header: Foo
> Accept: application/json
> Content-Length: 7
> Content-Type: application/x-www-form-urlencoded
>
> foo=bar
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 1330
>
> {
>   "log": {
>     "version": "1.2",
>     "creator": {
>       "name": "mockbin.org", 
>       "version": "1.0.1"
>     },
>     "entries": [{
>       "clientIPAddress": "192.0.189.88", 
>       "startedDateTime": "2015-03-05T20:31:31.665Z",
>       "request": {
>         "method": "POST",
>         "url": "http://localhost/har/any/path?foo=bar&foo=baz&key=value",
>         "httpVersion": "HTTP/1.1",
>         "cookies": [
>           {
>             "name": "World",
>             "value": "Universe"
>           },
>           {
>             "name": "Greet",
>             "value": "Hello"
>           }
>         ],
>         "headers": [
>           {
>             "name": "content-type",
>             "value": "application/x-www-form-urlencoded"
>           },
>           {
>             "name": "content-length",
>             "value": "7"
>           },
>           {
>             "name": "accept",
>             "value": "application/json"
>           },
>           {
>             "name": "x-custom-header",
>             "value": "Foo"
>           },
>           {
>             "name": "cookie",
>             "value": "Greet=Hello;World=Universe"
>           },
>           {
>             "name": "host",
>             "value": "localhost:3000"
>           }
>         ],
>         "queryString": [
>           {
>             "name": "key",
>             "value": "value"
>           },
>           {
>             "name": "foo",
>             "value": [
>               "bar",
>               "baz"
>             ]
>           }
>         ],
>         "postData": {
>           "mimeType": "application/x-www-form-urlencoded",
>           "text": "foo=bar",
>           "params": [
>             {
>               "name": "foo",
>               "value": "bar"
>             }
>           ]
>         },
>         "headersSize": 267,
>         "bodySize": 7
>       }
>     }]
>   }
> }
> ```

----

### Compression

#### Gzip

> ##### `GET /gzip`

Identical to [`/echo`](#echo) but with forced compression on response body *(returns back all the info sent through your request in HAR format)*

###### Request

> ```http
> POST /gzip?foo=bar&foo=baz&key=value HTTP/1.1
> Host: mockbin.org
> Cookie: Greet=Hello;World=Universe
> X-Custom-Header: Foo
> Accept: application/json
> Content-Length: 7
> Content-Type: application/x-www-form-urlencoded
>
> foo=bar
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Encoding: gzip
> Transfer-Encoding: chunked
>
> [gzipped-data]
> ```

----

