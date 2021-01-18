const express = require('express')
const assetRouter = require("./routes/asset.router")
const mapRouter = require("./routes/map.router")
const checkPointRouter = require("./routes/check-point.router")
const bodyParser = require('body-parser')
const cors = require('cors')({
    origin: 'http://localhost:4200',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200
})

const web = express()

web.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
web.use(bodyParser.json()) // parse application/json

web.use(cors);
web.use('/api/asset', assetRouter)
web.use('/api/map', mapRouter)
web.use('/api/checkPoint', checkPointRouter)
web.use('/uploads', express.static('./uploads'));

module.exports = web;