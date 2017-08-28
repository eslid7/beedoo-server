'use strict'

const express = require('express')
const passport = require('passport')

const userController = require('../controllers/Users_Controller')
const authHelper = require('../config/utils/authHelpers')

const router = express.Router()

router.route('/google/login')
	.get(passport.authenticate('google', { scope: ['email'] }))

router.route('/google/callback')
	.get(passport.authenticate('google', {
		successRedirect: '/profile',
		failureRedirect: '/',
	}))

router.route('/facebook/login')
	.get(passport.authenticate('facebook', { scope: ['email'] }))

router.route('/facebook/callback')
	.get(passport.authenticate('facebook', {
		successRedirect: '/profile',
		failureRedirect: '/',
	}))

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
		res.redirect('/');
	})

module.exports = router