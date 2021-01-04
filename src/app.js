const express = require('express')
const routes = require("./routes")
const bodyParser = require('body-parser')
const cors = require('cors')({
    origin: 'http://localhost:4200',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200
})

const app = express()

app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json

app.use(cors);
app.use('/api', routes)
app.use('/uploads', express.static('./uploads'));

module.exports = app;