const mysql = require('mysql2')
require('dotenv').config()

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})

db.query('create table if not exists users (id int primary key auto_increment, name varchar(255) not null, lastname varchar(255), email varchar(255) not null unique key, pass varchar(255) not null, subscription int, create_date datetime not null)', (error, results) => {
  if (error) {
    console.error('Error creating table: ', error)
  }
  results && console.log('Table created successfully!')
})

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ', err)
    return
  }
  console.log('Connected to database!')
})

module.exports = db
