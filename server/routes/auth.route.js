'use strict'

const express = require('express')
const passport = require('passport')

const userController = require('../controllers/Users_Controller')
const authHelper = require('../config/utils/authHelpers')

const router = express.Router()

router.route('/signup')
	.post(userController.signup)

router.route('/accountConfirmation')
	.get(userController.validateAccount)

router.route('/resendMail')
	.post(userController.resendMail)

router.route('/login')
	.post(userController.login)

router.route('/google/login')
	.get(passport.authenticate('google', { scope: ['email'] }))

router.route('/google/callback')
	.get(passport.authenticate('google', {
		successRedirect: '/api/auth/successRedirect',
		failureRedirect: '/api/auth/failureRedirect'
	}))

router.route('/facebook/login')
	.get(passport.authenticate('facebook', { scope: ['email'] }))

router.route('/facebook/callback')
	.get(passport.authenticate('facebook', {
		successRedirect: '/api/auth/successRedirect',
		failureRedirect: '/api/auth/failureRedirect'
	}))

router.route('/successRedirect')
	.get((req, res) => {
		const user = req.user
		res.status(200).json({
			message: "Autenticación correctamente."
		})
	})

router.route('/failureRedirect')
	.get((req, res) => {
		res.status(400).json({
			error: 'ERROR: Error al intentar realizar la autenticación'
		})
	})

router.route('/authenticated')
	.get(authHelper.isAuth, (req, res) => {
		const user = req.user
		return res.status(200).json({
			authenticated: true,
			user
		})
	})

router.route('/logout')
	.get((req, res) => {
		req.logout();
		res.status(200).json({
			message: "Cierre de sesión."
		})
	})

module.exports = router