const mysql = require('mysql')

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'padelvlc'
})

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ', err)
    return
  }
  console.log('Connected to database!')
})

db.query('show tables from padelvlc', (err, rows) => {
  if (err) throw err
  console.log(rows)
  db.end()
})
