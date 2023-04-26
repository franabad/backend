const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 4000
const db = require('./db/db.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', (req, res) => {
  const { name, email, password, sub } = req.body
  bcrypt.hash(password, 10)
    .then(hashedPassword => {
      db.query('insert into users (name, email, password, sub) values (?, ?, ?, ?)', [name, email, hashedPassword, sub], (error, results) => {
        if (error) {
          console.error('Error al crear un nuevo usuario: ', error)
          res.status(500).json('El email proporcionado ya existe')
        } else {
          const newUser = { id: results.insertId, name, email, hashedPassword, sub }
          res.status(200).json(newUser)
        }
      })
    })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  db.query('select * from users where email = ?', [email], (error, results) => {
    if (error) {
      console.error('Error al loguearse: ', error)
      res.status(500).json('Error en el servidor')
    } else if (results.length === 0) {
      res.status(404).json('Usuario o contraseña incorrectos')
    } else {
      const user = results[0]
      bcrypt.compare(password, user.password)
        .then(result => {
          if (result) {
            const token = jwt.sign({ id: user.id, name: user.name, email: user.email, sub: user.sub }, process.env.JWT_SECRET, { expiresIn: '1m' })
            res.status(200).json({ token })
          } else {
            res.status(404).json('Usuario o contraseña incorrectos')
          }
        })
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
