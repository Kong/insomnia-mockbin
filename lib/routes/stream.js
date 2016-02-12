'use strict'

module.exports = function stream (req, res, next) {
  res.set({
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked'
  })

  // set default chunks to 10
  var chunks = req.params.chunks ? parseInt(req.params.chunks, 10) : 10

  // max out chunks at 100
  if (chunks > 100) {
    chunks = 100
  }

  var count = 1

  while (count <= chunks) {
    res.write(JSON.stringify({
      type: 'stream',
      chunk: count++
    }) + '\n')
  }

  res.end()
}
