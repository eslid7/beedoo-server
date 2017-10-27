'use strict'

const express = require('express')
const userController = require('../controllers/Users_Controller')
const router = express.Router()

router.route('/')
	.get()
	.post(userController.saveUser)
	.put(userController.updateUser)

module.exports = router