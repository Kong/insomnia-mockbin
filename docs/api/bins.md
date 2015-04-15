## API Endpoints

### Bins

#### Create Bin

> ##### `POST /bin/create`

Creates a new **Bin** with a mock HTTP response as described by a [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) body.

Responds with a `Location` header with the newly created **Bin**, e.g. `Location: /bin/3c149e20-bc9c-4c68-8614-048e6023a108` *(the Bin ID is also repeated in the body)*

- The [HAR Response Object](http://www.softwareishard.com/blog/har-12-spec/#response) sent at time of creation will determine what the response status, headers, content will be
- You can request the newly created Bin with *any* combination of the following:
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
> HTTP/1.1 201 Created
> Location: /bin/3c149e20-bc9c-4c68-8614-048e6023a108
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
