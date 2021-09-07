const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session')
// require('dotenv').config()


const PORT = process.env.PORT || 3001;

const app = express()
const apiHandler = require('./ApiHandler/apiHandler')

// middleware
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ["GET", "POST","PUT","DELETE"],
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
    key: 'userId',
    secret: 'HydeToken',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24
    }
}))

app.use('/', apiHandler)

app.listen(PORT, () => {
    console.log(`Server is listening to PORT ${PORT}`)
})





