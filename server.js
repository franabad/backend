const { createServer } = require('http')
// eslint-disable-next-line n/no-deprecated-api
const { parse } = require('url')
const express = require('express')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3002
// when using middleware `hostname` and `port` must be provided below
const app = express({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      if (pathname === '/a') {
        app.render(req, res, '/a', query)
      } else if (pathname === '/b') {
        app.render(req, res, '/b', query)
      } else {
        handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 400
      res.end('internal server error')
    }
  })
    .listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
})
