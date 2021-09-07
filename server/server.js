const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const db = require('./models')
const PORT = process.env.PORT || 3001;

// middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(express.json())
app.use(cookieParser())


app.listen(PORT, () => {
    console.log(`Server is listening to PORT ${PORT}`)
})
