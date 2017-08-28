'use strict'

const express = require('express')
const categoriesController = require('../controllers/Categories_Controller')
const router = express.Router()

router.route('/')
	.get(categoriesController.getAll)
	.post(categoriesController.saveCategory)

router.route('/:id')
	.get(categoriesController.getCategory)
	.put(categoriesController.updateCategory)
	.delete(categoriesController.deleteCategory)

module.exports = router