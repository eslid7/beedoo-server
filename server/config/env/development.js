'use strict'

module.exports = {
	mongoURL: 'mongodb://localhost/beedoo',
	env: 'dev',
	auth: {
		facebook: {
			clientId: '122423218407860',
			clientSecret: '1a783067179a4798aac942da2a5618b3',
			callbackURL: 'http://localhost:5050/api/auth/facebook/callback',
		},
		google: {
			clientId: '532003321960-g733bdbpj7lqoac3kueekiss3u6kuk46.apps.googleusercontent.com',
			clientSecret: 'OBnlU62zyd0ZZFtjPiZcFMYy',
			callbackURL: 'http://localhost:5050/api/auth/google/callback'
		}
	}
}