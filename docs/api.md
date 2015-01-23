Unless otherwise indicated, all Endpoints will accept *any* HTTP request with *any* header, using *any* HTTP Method.

## `/ip`

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
> X-Powered-By: httpconsole.com
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 12
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> "10.10.10.1"
> ```

----

## `/ips`

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
> X-Powered-By: httpconsole.com
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 42
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> ["10.10.10.1", "10.10.10.2", "10.10.10.3"]
> ```

----

## `/agent`

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
> X-Powered-By: httpconsole.com
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 13
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> "curl/7.35.0"
> ```

----

## `/status/:code/:reason`

Returns a response with the given HTTP Status code and message in status line and body.

###### Request

> ```http
> GET /status/20/Hello HTTP/1.1
> Host: httpconsole.com
>
> ```

###### Response

> ```http
> HTTP/1.1 20 Hello
> X-Powered-By: httpconsole.com
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> Content-Type: text/html; charset=utf-8
> Content-Length: 38
> Date: Thu, 22 Jan 2015 03:46:45 GMT
> Connection: keep-alive
>
> {
>   "code": 20,
>   "message": "Hello"
> }
> ```

----

## `/headers`

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
> X-Powered-By: httpconsole.com
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 306
> Date: Thu, 22 Jan 2015 03:49:12 GMT
> Connection: keep-alive
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
>     }
>   ],
>   "headersSize": 124
> }
> ```

----

## `/request`

Returns back all the info sent through your request in HAR format

###### Request

> ```http
> POST /request?foo=bar&foo=baz&key=value HTTP/1.1
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
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> X-Powered-By: httpconsole.com
> Content-Type: application/json; charset=utf-8
> Content-Length: 1330
> Date: Thu, 22 Jan 2015 04:02:43 GMT
> Connection: keep-alive
>
> {
>   "request": {
>     "method": "POST",
>     "url": "http://localhost/request?foo=bar&foo=baz&key=value",
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

## `/gzip`

Just like [`/request`](-request) but with forced compression on response body *(returns back all the info sent through your request in HAR format)*

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
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> X-Powered-By: httpconsole.com
> Content-Type: application/json; charset=utf-8
> Content-Encoding: gzip
> Date: Thu, 22 Jan 2015 04:08:04 GMT
> Connection: keep-alive
> Transfer-Encoding: chunked
>
> [gzipped-data]
> ```

----

## `/bin/create`


Creates a new **Bin** with a mocked aHTTP response as described by a [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) body.

Accepts **POST** Method only!

Responds with a `Location` header with the newly created **Bin**, e.g. `Location: http://httpconsole.com/b8b21988-64d4-4eb3-94c1-2055c3374b53` *(also repeated in the body)*

- The [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) sent at time of creation will determine what the response status, headers, content will be.
- Newly created **Bin** will collect requests made to it and allow later inspection.
- You can query the new **Bin** with any HTTP Method, Headers, Content you desire, everything will be logged for later access.
- You can use this to see what your HTTP client is sending or to inspect and debug webhook requests.
- Each **Bin** will log a maximum of 100 requests.

###### Request

> ```http
> POST /create HTTP/1.1
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
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> X-Powered-By: httpconsole.com
> Location: http://httpconsole.com/b8b21988-64d4-4eb3-94c1-2055c3374b53
> Content-Type: application/json; charset=utf-8
> Content-Length: 38
> Date: Thu, 22 Jan 2015 04:19:11 GMT
> Connection: keep-alive
>
> "b8b21988-64d4-4eb3-94c1-2055c3374b53"
> ```

----

## `/bin/:id`

The [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) sent at time of [creation](-/bin/create) will determine what the response status, headers, content will be.

If you wish to inspect this **Bin** in a browser window, be sure to add `?__inspect` to the url, otherwise, there's a chance you'll see the HAR content instead *(varies on your browser's `Accept` header)*

###### Request

> ```http
> GET /bin/:id HTTP/1.1
> Host: httpconsole.com
>
> ```

###### Response

*see [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) for more details.*

> ```http
> [response.httpVersion] [response.status] [response.statusText]
> Vary: X-HTTP-Method-Override, Accept, Accept-Encoding
> X-Powered-By: httpconsole.com
> Content-Type: [response.content.mimeType]
> Connection: keep-alive
> [response.headers]
>
> [response.content.text]
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

----
