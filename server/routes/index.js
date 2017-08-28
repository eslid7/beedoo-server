'use strict'

const express = require('express')
const authRoutes = require('./auth.route')
const companyRoutes = require('./company.route')
const serverRoutes = require('./server.route')
const categoryRoutes = require('./category.route')
const userRoutes = require('./user.route')
const router = express.Router()

router.use('/auth', authRoutes)
router.use('/companies', companyRoutes)
router.use('/servers', serverRoutes)
router.use('/categories', categoryRoutes)
router.use('/users', userRoutes)

module.exports = router