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
  db.query('insert into users (name, email, password, sub) values (?, ?, ?, ?)', [name, email, password, sub], (error, results) => {
    if (error) {
      console.error('Error al crear un nuevo usuario: ', error)
      res.status(500).json('Email ya existente')
    } else {
      const newUser = { id: results.insertId, name, email, password, sub }
      res.status(200).json(newUser)
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
