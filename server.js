const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 4000
const db = require('./db/db.js')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', (req, res) => {
  const { name, email, password, sub } = req.body
  db.query(
    'insert into users values (name, email, password, sub) values (?,?,?,?)',
    [name, email, password, sub],
    (error, results, fields) => {
      if (error) {
        console.error('Error al crear un nuevo usuario: ', error)
        res.sendStatus(500)
      } else {
        res.json({ id: results.insertId })
      }
    }
  )
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
