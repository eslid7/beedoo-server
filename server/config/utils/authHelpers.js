'use strict'

function isAuth(req, res, next) {
	if (req.isAuthenticated()) {
		next()
	} else {
		return res.status(401).json({ authenticated: false })
	}
}

module.exports = {
	isAuth
}