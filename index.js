// import { useState } from 'react'
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001
const db = require('./db/db.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')

dotenv.config()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({ credentials: true, origin: process.env.url_dev }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', (req, res) => {
  const now = new Date()
  const { email, name, lastname, password } = req.body
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)
  const lastnameCapitalized = lastname.charAt(0).toUpperCase() + lastname.slice(1)
  req.body.create_date = now
  bcrypt.hash(password, 10)
    .then(hashedPassword => {
      db.query('insert into users (email, pass, name, lastname, create_date) values (?, ?, ?, ?, now())', [email, hashedPassword, nameCapitalized, lastnameCapitalized], (error, results) => {
        if (error) {
          console.error('El email ya existe: ', error)
          res.status(502).json(null)
        } else {
          const newUser = { id: results.insertId, email, hashedPassword, name, lastname }
          res.status(200).json(newUser)
        }
      })
    })
})

app.post('/profile', (req, res) => {
  const { email } = req.body
  db.query('select * from users where email = ?', [email], (error, results) => {
    if (error) {
      console.error('Error a la hora de fetchear el perfil ', error)
      res.status(502).json(null)
    } else {
      console.log('El perfil fetcheado', results)
      const user = results[0]
      res.status(200).json({ email: user.email, name: user.name, lastname: user.lastname, password: user.pass })
    }
  })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  db.query('select * from users where email = ?', [email], (error, results) => {
    console.log('results del login:', results)
    if (error) {
      console.log('Error al loguearse: ', error)
      res.status(500).json(null)
    } else if (results.length === 0) {
      console.log('Usuario o contraseña incorrectos')
      res.status(401).json(null)
    } else {
      const user = results[0]
      bcrypt.compare(password, user.pass)
        .then(result => {
          if (result) {
            const sessionID = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET)
            res.cookie('sessionID', sessionID, { maxAge: 120000, httpOnly: true })
            res.status(200).json({ id: user.id, email: user.email, name: user.name, message: 'Sesión iniciada' })
          } else {
            res.status(500).json(null)
          }
        })
        .catch(error => {
          console.log('Error al comparar contraseñas: ', error)
          res.status(500).json('Error en el servidor')
        })
    }
  })
})

app.post('/profile', (req, res) => {

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
