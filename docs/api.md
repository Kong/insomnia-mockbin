## API Endpoints

### Buckets

#### Create Bucket

##### `POST /bucket/create/view`

Creates a new **Bucket** with a mocked aHTTP response as described by a [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) body.

Responds with a `Location` header with the newly created **Bucket**, e.g. `Location: http://httpconsole.com/b8b21988-64d4-4eb3-94c1-2055c3374b53` *(also repeated in the body)*

- The [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) sent at time of creation will determine what the response status, headers, content will be.
- Newly created Bucket will collect requests made to it and allow [later inspection](#view-logs).
- You can query the new Bucket with any HTTP Method, Headers, Content you desire, everything will be [logged](#view-logs) for later access.
- You can use this to see what your HTTP client is sending or to inspect and debug webhook requests.
- Each Bucket will log a maximum of 100 requests.

###### Request

> ```http
> POST /bucket/create HTTP/1.1
> User-Agent: curl/7.35.0
> Host: httpconsole.com
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
> Location: http://httpconsole.com/b8b21988-64d4-4eb3-94c1-2055c3374b53
> Content-Type: application/json; charset=utf-8
> Content-Length: 38
>
> "b8b21988-64d4-4eb3-94c1-2055c3374b53"
> ```

----

#### Inspect Bucket

##### `GET /bucket/:id/view`

###### Request

> ```http
> GET /bucket/b8b21988-64d4-4eb3-94c1-2055c3374b53/view HTTP/1.1
> Host: httpconsole.com
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

#### Query Bucket

##### `/bucket/:id`

The [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) sent at time of [creation](#create-bucket) will determine what the response status, headers, content will be.

You can query the new Bucket with any HTTP Method, Headers, Content you desire, everything will be logged for later access.

###### Request

> ```http
> GET /bucket/:id HTTP/1.1
> Host: httpconsole.com
>
> ```

###### Response

*see [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) for more details.*

> ```http
> [response.httpVersion] [response.status] [response.statusText]
> Content-Type: [response.content.mimeType]
> [response.headers]
>
> [response.content.text]
> ```

###### Example:

###### Request

> ```http
> GET /bucket/b8b21988-64d4-4eb3-94c1-2055c3374b53/view HTTP/1.1
> Host: httpconsole.com
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

###### Example:

The following HAR Response Object:

```json
{
  "status": 700,
  "statusText": "HELLO",
  "httpVersion": "HTTP/1.1",
  "headers": [
    {
      "name": "Date",
      "value": "Wed, 21 Jan 2015 23:36:35 GMT"
    },
    {
      "name": "Server",
      "value": "Apache"
    },
    {
      "name": "Transfer-Encoding",
      "value": "chunked"
    },
    {
      "name": "Content-Type",
      "value": "text/html; charset=UTF-8"
    },
    {
      "name": "Cache-Control",
      "value": "max-age=7200"
    },
    {
      "name": "Connection",
      "value": "Keep-Alive"
    },
    {
      "name": "Keep-Alive",
      "value": "timeout=5, max=50"
    },
    {
      "name": "Expires",
      "value": "Thu, 22 Jan 2015 01:36:35 GMT"
    }
  ],
  "cookies": [],
  "content": {
    "size": 37,
    "mimeType": "text/html",
    "text": "<html><body>Hello World</body></html>"
  },
  "redirectURL": "",
  "headersSize": 323,
  "bodySize": 37
}
```

will generate the following HTTP response

```http
HTTP/1.1 700 HELLO
X-Powered-By: httpconsole.com
Date: Wed, 21 Jan 2015 23:36:35 GMT
Server: Apache
Transfer-Encoding: chunked
Content-Type: text/html; charset=utf-8
Cache-Control: max-age=7200
Connection: Keep-Alive
Keep-Alive: timeout=5, max=50
Expires: Thu, 22 Jan 2015 01:36:35 GMT
Vary: Accept, Accept-Encoding
Content-Length: 37

<html><body>Hello World</body></html>
```

#### Bucket Access Log

##### `/bucket/:id/log`

List all requests made to this bucket, using HAR log format.

###### Request

> ```http
> GET /bucket/b8b21988-64d4-4eb3-94c1-2055c3374b53/log HTTP/1.1
> Host: httpconsole.com
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
>       "name": "httpconsole.com", 
>       "version": "1.0.1"
>   }, 
>   "entries": [
>       ...
>   ]
> }
> ```

----

### Utility

#### IP

##### `/ip`

Returns Origin IP.

###### Request

> ```http
> GET /ip HTTP/1.1
> Host: httpconsole.com
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

##### `/ips`

Parses the "X-Forwarded-For" ip address list and return an array. Otherwise, an empty array is returned.

###### Request

> ```http
> GET /ips HTTP/1.1
> Host: httpconsole.com
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

#### User Agent

##### `/agent`

Returns user-agent.

###### Request

> ```http
> GET /agent HTTP/1.1
> User-Agent: curl/7.35.0
> Host: httpconsole.com
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

#### HTTP Status

##### `/status/:code/:reason`

Returns a response with the given HTTP Status code and message in status line and body.

| Parameter | Type   | Required | Default |
| --------- | ------ | -------- | ------- |
| `:code`   | Number | yes      | `200`   |
| `:reason` | String | no       | `OK`    |

###### Request

> ```http
> GET /status/20/Hello HTTP/1.1
> Host: httpconsole.com
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

#### HTTP Headers

##### `/headers`

Returns list of all headers used in request as well as total number of bytes from the start of the HTTP request message until (and including) the double CRLF before the body.

###### Request

> ```http
> GET /headers HTTP/1.1
> Host: httpconsole.com
> User-Agent: curl/7.35.0
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
>       "value": "httpconsole.com"
>     },
>     {
>       "name": "user-agent",
>       "value": "curl/7.35.0"
>     }:name
>   ],
>   "headersSize": 124
> }
> ```

----

##### `/header/:name`

Returns the value of header with the name `:name`

###### Request

> ```http
> GET /header/x-custom-header HTTP/1.1
> Host: httpconsole.com
> User-Agent: curl/7.35.0
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

----

#### Cookies

##### `/cookies`

Returns list of all cookies sent by the client

###### Request

> ```http
> GET /cookies HTTP/1.1
> Host: httpconsole.com
> User-Agent: curl/7.35.0
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

##### `/cookie/:name`

Returns the value of the cookie with the name `:name`

###### Request

> ```http
> GET /header/my-cookie HTTP/1.1
> Host: httpconsole.com
> User-Agent: curl/7.35.0
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

#### Redirects

##### `/redirect/:status/:count/?to=:url`

Start a redirects loop using the redirect custom status code: `status`, looping through the url pattern: `/redirect/:status/[:count -1]` eventually landing on `:url` *(or `/redirect/:status/0` if no `url` was provided)*

###### Parameters

| Parameter | Type   | Required | Default | Note                                                                                                         |
| --------- | ------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `:status` | Number | no       | `302`   | must be a valid [3xx redirection](http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml) |
| `:count`  | Number | no       | `0`     | amount of redirect loops to go through                                                                       |
| `?to`     | String | no       | `null`  | URL or Path to redirect to                                                                                   |


##### `/redirect/:status`

###### Request

> ```http
> GET /redirect/308 HTTP/1.1
> Host: httpconsole.com
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

##### `/redirect/:status?to=:url`

###### Request

> ```http
> GET /redirect/308?to=https://www.mashape.com/ HTTP/1.1
> Host: httpconsole.com
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

##### `/redirect/:status/:count`

###### Request

> ```http
> GET /redirect/308/3 HTTP/1.1
> Host: httpconsole.com
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

#### Stream

##### `/stream/:chunks`

Streams a chunked response, defaults to 10 chunks with an upper limit of 100

###### Request

> ```http
> GET /stream/4 HTTP/1.1
> Host: httpconsole.com
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

#### Delay

##### `/delay/:ms`

Returns a response after a delay in milliseconds, default is 200ms

###### Request

> ```http
> GET /delay/5000 HTTP/1.1
> Host: httpconsole.com
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

#### Debugging

##### `/echo`

Returns a response with identical `Body` and `Content-Type` to what's in teh request.

###### Request

> ```http
> POST /echo HTTP/1.1
> Host: httpconsole.com
> Content-Type: application/json
> Content-Length: 14
>
> {"foo": "bar"}
> ```

----

###### Response

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json; charset=utf-8
> Content-Length: 14
>
> {"foo": "bar"}
> ```

##### `/debug/:path`

Returns back all the info sent through your request in HAR format

###### Request

> ```http
> POST /debug/any/path?foo=bar&foo=baz&key=value HTTP/1.1
> Host: httpconsole.com
> User-Agent: curl/7.35.0
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
>     "url": "http://localhost/echo?foo=bar&foo=baz&key=value",
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
>       },
>       {
>         "name": "user-agent",
>         "value": "curl/7.35.0"
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

----

#### Compression

##### `/gzip`

Identical to [`/echo`](#-echo-) but with forced compression on response body *(returns back all the info sent through your request in HAR format)*

###### Request

> ```http
> POST /gzip?foo=bar&foo=baz&key=value HTTP/1.1
> Host: httpconsole.com
> User-Agent: curl/7.35.0
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

