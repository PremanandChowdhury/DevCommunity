const express = require('express')
const app = express()

// Init Middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) => res.send('API Running.'))

// Define Routes
app.use('/api/users', require('./api/users'))
app.use('/api/auth', require('./api/auth'))
app.use('/api/posts', require('./api/posts'))
app.use('/api/profile', require('./api/profile'))

module.exports = app
