'use strict'

import { debuglog, format } from 'util'
const debug = debuglog('mockbin')

export default function (req, res, next) {
  this.client.get('bin:' + req.params.uuid, function (err, value) {
    if (err) {
      debug(err)

      throw err
    }

    if (value) {
      res.json({
        method: 'POST',
        url: format('%s://%s/bin/%s', req.protocol, req.hostname, req.params.uuid),
        httpVersion: 'HTTP/1.1',
        queryString: [
          {
            name: 'foo',
            value: 'bar'
          },
          {
            name: 'foo',
            value: 'baz'
          }
        ],
        headers: [
          {
            name: 'Accept',
            value: 'application/json'
          },
          {
            name: 'Content-Type',
            value: 'application/x-www-form-urlencoded'
          }
        ],
        cookies: [
          {
            name: 'foo',
            value: 'bar'
          },
          {
            name: 'bar',
            value: 'baz'
          }
        ],
        postData: {
          mimeType: 'application/x-www-form-urlencoded',
          params: [{
            name: 'foo',
            value: 'bar'
          },
          {
            name: 'bar',
            value: 'baz'
          }]
        }
      })
    }
  })
}
