// import { useState } from 'react'
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3002
const db = require('./db/db.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')

dotenv.config()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', (req, res) => {
  const { email, password, name, lastname } = req.body
  bcrypt.hash(password, 10)
    .then(hashedPassword => {
      db.query('insert into users (email, pass, name, lastname) values (?, ?, ?, ?)', [email, hashedPassword, name, lastname], (error, results) => {
        if (error) {
          console.error('Error al crear un nuevo usuario: ', error)
          res.status(500).json('El email proporcionado ya existe')
        } else {
          const newUser = { id: results.insertId, email, hashedPassword }
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
      bcrypt.compare(password, user.pass)
        .then(result => {
          if (result) {
            const sessionID = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET)
            res.cookie('sessionID', sessionID, { maxAge: 120000, httpOnly: true })
            res.status(200).json({ id: user.id, email: user.email, sessionID })
          } else {
            res.status(500).json(null)
          }
        })
    }
  })
})

app.get('/login', (req, res) => {
  const sessionID = req.cookies.sessionID
  if (!sessionID) {
    return res.status(401).json('No hay sesión iniciada')
  }

  try {
    const decodedToken = jwt.verify(sessionID, process.env.JWT_SECRET)
    const { name } = decodedToken
    // aquí puede realizar cualquier verificación adicional que desee hacer antes de permitir que el usuario acceda a la página de inicio de sesión
    res.status(200).json(`Bienvenido, ${name}!`)
  } catch (error) {
    res.status(401).json('Sesión no válida')
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
