'use strict'

const express = require('express')
const companiesController = require('../controllers/Companies_Controller')
const router = express.Router()

router.route('/')
	.get(companiesController.getAll)
	.post(companiesController.saveCompany)

router.route('/:id')
	.get(companiesController.getCompany)
	.put(companiesController.updateCompany)
	.delete(companiesController.deleteCompany)

module.exports = router