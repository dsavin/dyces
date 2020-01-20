const express = require('express');
const app = express.Router();

app.use('/users', require('./users/index'));

module.exports = app;
