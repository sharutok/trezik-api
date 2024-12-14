const express = require('express')
const app = express()
const cors = require("cors")
const compression = require("compression")
const helmet = require("helmet")
const router = require('./Router/pushdata')
const morgan = require('morgan')
const { HealthCheck } = require('./Controller/healthcheck')
require('dotenv').config('.env')

app.use(compression())
app.use(cors())
app.use(helmet());
app.use(morgan('dev'))
app.use('/health-check', HealthCheck)

app.use('/api/push/data', router)

module.exports=app
