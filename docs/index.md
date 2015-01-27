## Overview 

### HTTP Methods

**Unless otherwise indicated** all Endpoints will accept *any* HTTP request with *any* header, using *any* HTTP Method.

```shell
# GET /echo
curl -X GET httpconsole.com/echo

# POST /echo
curl -X POST

# DELETE /echo
curl -X DELETE httpconsole.com/echo

# PATCH /echo
curl -X PATCH httpconsole.com/echo

# FOO /echo
curl -X FOO httpconsole.com/echo

# BAR /echo
curl -X BAR httpconsole.com/echo

# MY-METHOD /echo
curl -X MY-METHOD httpconsole.com/echo
```

### Content Negotiation

HTTP Console is able to response in a number of formats: YAML, JSON, XML, HTML. The response varies based on `Accept` header:

```shell
# Response in YAML (default)
curl httpconsole.com/echo -H "Accept: application/yaml" 

# Response in JSON
curl httpconsole.com/echo -H "Accept: application/json" 

# Response in XML
curl httpconsole.com/echo -H "Accept: application/xml" 

# Response in HTML 
curl httpconsole.com/echo -H "Accept: text/html" 
```

### JSONP Callbacks

You can recieve a JSONP response by adding the query string `__callback`:

```shell
curl httpconsole.com/echo?__callback=myfunc -H "Accept: application/json"
```
