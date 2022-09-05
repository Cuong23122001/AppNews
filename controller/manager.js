const express = require('express')
const { append, redirect } = require('express/lib/response')
const async = require('hbs/lib/async')
const { ObjectId, getDB, insertObject } = require('../databaseHandle')
const { requireManager } = require('../middleware');











const router = express.Router()
module.exports = router;