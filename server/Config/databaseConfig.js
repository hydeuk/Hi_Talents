const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234567890',
    database: 'portal_system'
})

db.connect(function (err) {
    if (err) {
        console.log('Database Connection Error')
    } else {
        console.log('Database Connected!')
    }
})

module.exports = { db }