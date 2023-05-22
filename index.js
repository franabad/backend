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
  req.body.create_date = now
  bcrypt.hash(password, 10)
    .then(hashedPassword => {
      db.query('insert into users (email, pass, name, lastname, create_date) values (?, ?, ?, ?, now())', [email, hashedPassword, name, lastname], (error, results) => {
        if (error) {
          console.error('Error al crear un nuevo usuario: ', error)
          res.status(500).json('El email proporcionado ya existe')
        } else {
          const newUser = { id: results.insertId, email, hashedPassword, name, lastname }
          res.status(200).json(newUser)
        }
      })
    })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  console.log('email:', email, 'password:', password)
  db.query('select * from users where email = ?', [email], (error, results) => {
    console.log('results:', results)
    if (error) {
      console.log('Error al loguearse: ', error)
      res.status(500).json('Error en el servidor')
    } else if (results.length === 0) {
      console.log('Usuario o contraseña incorrectos')
      res.status(401).json(null)
    } else {
      const user = results[0]
      console.log('user:', user)
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
