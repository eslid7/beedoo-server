'use strict'

const moment = require('moment')
const FacebookStrategy = require('passport-facebook').Strategy
const config = require('../env')
const userController = require('../../controllers/Users_Controller')

module.exports = new FacebookStrategy({
	clientID: config.auth.facebook.clientId,
	clientSecret: config.auth.facebook.clientSecret,
	callbackURL: config.auth.facebook.callbackURL,
	profileFields: ['id', 'displayName', 'email', 'birthday', 'gender', 'picture.type(large)', 'name']
}, (accessToken, refreshToken, profile, done) => {
	let gender = 'U'
	switch (profile._json.gender) {
		case 'male':
			gender = 'H'
		break;

		case 'female':
			gender = 'M'
		break;

		default:
			gender = 'U'
		break;
	}

	const userData = {
		username: profile._json.id,
		name: profile._json.first_name,
		lastName: profile._json.last_name,
		secondLastName: '',
		createdAt: moment(new Date()).format('DD-MMM-YYYY'),
		updateAt: moment(new Date()).format('DD-MMM-YYYY'),
		email: profile._json.email,
		facebook: 1,
		google: 0,
		phone: '',
		password: profile._json.id,
		status: 1,
		verifiedAccount: 1,
		avatar: profile._json.picture.data.url,
		gender
	}

	userController.saveUser(userData)
		.then(user => done(null, user))
		.catch(err => done(err))
})