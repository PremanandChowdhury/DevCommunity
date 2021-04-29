const express = require('express')
const connectDB = require('./config/db')
const indexRouter = require('./routes/index')

const app = express()

// Connect Database
connectDB()

app.use('/', indexRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Listening to ${PORT} port no.`)
})
