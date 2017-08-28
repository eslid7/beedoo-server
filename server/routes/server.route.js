'use strict'

const express = require('express')
const serversController = require('../controllers/Servers_Controller')
const router = express.Router()

router.route('/')
	.get(serversController.getAll)
	.post(serversController.saveServer)

router.route('/promises')
	.get(serversController.testPromises)

router.route('/promises2')
	.get(serversController.testPromises2)

router.route('/:id')
	.get(serversController.getServer)
	.put(serversController.updateServer)
	.delete(serversController.deleteServer)

module.exports = router