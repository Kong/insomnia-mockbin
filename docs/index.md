## Overview 

### HTTP Methods

**Unless otherwise indicated** all Endpoints will accept *any* HTTP request with *any* header, using *any* HTTP Method.

```shell
# GET /request
curl -X GET mockbin.com/request

# POST /request
curl -X POST

# DELETE /request
curl -X DELETE mockbin.com/request

# PATCH /request
curl -X PATCH mockbin.com/request

# FOO /request
curl -X FOO mockbin.com/request

# BAR /request
curl -X BAR mockbin.com/request

# MY-METHOD /request
curl -X MY-METHOD mockbin.com/request
```

### Content Negotiation

mockbin is able to response in a number of formats: JSON, YAML, XML, HTML. The response varies based on `Accept` header:

```shell
# Response in JSON (default)
curl mockbin.com/request -H "Accept: application/json" 

# Response in YAML
curl mockbin.com/request -H "Accept: application/yaml" 

# Response in XML
curl mockbin.com/request -H "Accept: application/xml" 

# Response in HTML 
curl mockbin.com/request -H "Accept: text/html" 
```

### JSONP Callbacks

You can recieve a JSONP response by adding the query string `__callback`:

```shell
curl mockbin.com/request?__callback=myfunc -H "Accept: application/json"
```
