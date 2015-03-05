## Overview 

### HTTP Methods

**Unless otherwise indicated** all Endpoints will accept *any* HTTP request with *any* header, using *any* HTTP Method.

```shell
# GET /request
curl -X GET httpconsole.com/request

# POST /request
curl -X POST

# DELETE /request
curl -X DELETE httpconsole.com/request

# PATCH /request
curl -X PATCH httpconsole.com/request

# FOO /request
curl -X FOO httpconsole.com/request

# BAR /request
curl -X BAR httpconsole.com/request

# MY-METHOD /request
curl -X MY-METHOD httpconsole.com/request
```

### Content Negotiation

HTTP Console is able to response in a number of formats: JSON, YAML, XML, HTML. The response varies based on `Accept` header:

```shell
# Response in JSON (default)
curl httpconsole.com/request -H "Accept: application/json" 

# Response in YAML
curl httpconsole.com/request -H "Accept: application/yaml" 

# Response in XML
curl httpconsole.com/request -H "Accept: application/xml" 

# Response in HTML 
curl httpconsole.com/request -H "Accept: text/html" 
```

### JSONP Callbacks

You can recieve a JSONP response by adding the query string `__callback`:

```shell
curl httpconsole.com/request?__callback=myfunc -H "Accept: application/json"
```
