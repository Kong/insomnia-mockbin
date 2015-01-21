## Features

- uses HAR format
- supports JSON, YAML, XML, HTML output
- plays nice with proxies (uses the X-Forwarded-* headers for IP resolution)
- allows for HTTP Method Override using one of the headers (`X-HTTP-Method`, `X-HTTP-Method-Override`, `X-Method-Override`) or through query string parameter: `_method`

## Endpoints

### `/ip`

> Returns Origin IP.

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
> Vary: Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 12
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> "10.10.10.1"
> ```

----

### `/ips`

> parses the "X-Forwarded-For" ip address list and return an array. Otherwise, an empty array is returned.

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
> Vary: Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 42
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> ["10.10.10.1", "10.10.10.2", "10.10.10.3"]
> ```

----

### `/user-agent`

> Returns user-agent.

###### Request

> ```http
> GET /ip HTTP/1.1
> User-Agent: curl/7.35.0
> Host: httpconsole.com
> Accept: application/json
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> X-Powered-By: httpconsole.com
> Vary: Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 13
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> "curl/7.35.0"
> ```

----

### `/status/:code/:reason`

> Returns given HTTP Status code.

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
> Vary: Accept, Accept-Encoding
> Content-Type: text/html; charset=utf-8
> Date: Wed, 21 Jan 2015 06:53:38 GMT
> Connection: keep-alive
> Transfer-Encoding: chunked
>
> ```

----

### `/headers`

>

###### Request

> ```http
> GET /headers HTTP/1.1
> Host: httpconsole.com
> User-Agent: curl
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> X-Powered-By: httpconsole.com
> Vary: Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 245
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> {
>   "headers": [
>     {
>       "name": "user-agent",
>       "value": "curl"
>     },
>     {
>       "name": "accept",
>       "value": "application/json"
>     },
>     {
>       "name": "host",
>       "value": "httpconsole.com"
>     }
>   ],
>   "headersSize": 108
> }
> ```

----

### `/request`

>

###### Request

> ```http
> GET / HTTP/1.1
> Host: httpconsole.com
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> X-Powered-By: httpconsole.com
> Vary: Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 13
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> ```

----

### `/gzip`

>

###### Request

> ```http
> GET / HTTP/1.1
> Host: httpconsole.com
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> X-Powered-By: httpconsole.com
> Vary: Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 13
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> ```

----

### `/`

>

###### Request

> ```http
> GET / HTTP/1.1
> Host: httpconsole.com
>
> ```

###### Response

> ```http
> HTTP/1.1 200 OK
> X-Powered-By: httpconsole.com
> Vary: Accept, Accept-Encoding
> Content-Type: application/json; charset=utf-8
> Content-Length: 13
> Date: Wed, 21 Jan 2015 06:56:11 GMT
> Connection: keep-alive
>
> ```

----
