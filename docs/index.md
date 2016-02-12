## Overview 

### HTTP Methods

**Unless otherwise indicated**: all Endpoints will accept *any* HTTP request with *any* header, using *any of the supported* HTTP Methods: `DELETE`, `GET`, `HEAD`, `POST`, `PUT`, `OPTIONS`, `TRACE`, `COPY`, `LOCK`, `MKCOL`, `MOVE`, `PROPFIND`, `PROPPATCH`, `SEARCH`, `UNLOCK`, `REPORT`, `MKACTIVITY`, `CHECKOUT`, `MERGE`, `M-SEARCH`, `NOTIFY`, `SUBSCRIBE`, `UNSUBSCRIBE`, `PATCH`, `PURGE`

```
# GET
curl mockbin.org/request

# PATCH
curl -X PATCH mockbin.org/request

# SEARCH /request
curl -X SEARCH mockbin.org/request
```

You can use the `X-HTTP-Method-Override` header to mock a custom HTTP Method by sending a `POST` request with the desired HTTP method:

```shell
# SEARCH /request
curl -X POST -H "X-HTTP-Method-Override: HELLO" mockbin.org/request
```

### Content Negotiation

mockbin is able to respond in a number of formats: JSON, YAML, XML, HTML. The response varies based on `Accept` header:

```shell
# Response in JSON (default)
curl mockbin.org/request -H "Accept: application/json" 

# Response in YAML
curl mockbin.org/request -H "Accept: application/yaml" 

# Response in XML
curl mockbin.org/request -H "Accept: application/xml" 

# Response in HTML 
curl mockbin.org/request -H "Accept: text/html" 
```

### JSONP Callbacks

You can receive a JSONP response by adding the query string `__callback`:

```shell
curl mockbin.org/request?__callback=myfunc -H "Accept: application/json"
```
