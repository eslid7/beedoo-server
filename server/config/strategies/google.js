'use strict'

const moment = require('moment')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../env')
const userController = require('../../controllers/Users_Controller')

module.exports = new GoogleStrategy({
	clientID: config.auth.google.clientId,
	clientSecret: config.auth.google.clientSecret,
	callbackURL: config.auth.google.callbackURL,
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
		name: profile._json.name.givenName,
		lastName: profile._json.name.familyName,
		secondLastName: '',
		createdAt: moment(new Date()).format('DD-MMM-YYYY'),
		updateAt: moment(new Date()).format('DD-MMM-YYYY'),
		email: profile._json.emails[0].value,
		facebook: 0,
		google: 1,
		phone: '',
		password: profile._json.id,
		status: 1,
		verifiedAccount: 1,
		avatar: profile._json.image.url,
		gender
	}

	userController.saveUser(userData)
		.then(user => done(null, user))
		.catch(err => done(err))
})