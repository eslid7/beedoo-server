'use strict'

const userModel = require('../models/User')
const jwt = require('jsonwebtoken')

function getUser (req, res) {

}

function saveUser (user) {
	// se busca primero para ver si no existe
	return userModel.findOne({'username': user.username, 'email': user.email}).then(function (userData) {
		return userData
	}).then(function (userData) {
		if (userData) {
			return userData
		} else {
			//se crea un token para el usuario
			const tempToken = jwt.sign({id: user.username}, 'b33dd00')
			user.token = tempToken
			const dataToSave = new userModel(user)
			//se salva el usuario
			return dataToSave.save().then(function (userSaved) {
				return userSaved
			}).then(function (userData) {
				return userData
			}).catch(function (err) {
				// en caso de error se devuelve el error
				return err
			})
		}
	}).then(function (userData) {
		return {
			id: userData.id,
			token: userData.token,
			username: userData.username,
			name: userData.name,
			lastName: userData.lastName,
			secondLastName: userData.secondLastName,
			createdAt: userData.createdAt,
			updateAt: userData.updateAt,
			email: userData.email,
			facebook: userData.facebook,
			google: userData.google,
			phone: userData.phone,
			password: userData.password,
			status: userData.status,
			verifiedAccount: userData.verifiedAccount,
			avatar: userData.avatar,
			gender: userData.gender
		}
	}).catch(function (err) {
		// en caso de error se devuelve el error
		return err
	})
}

module.exports = {
	getUser,
	saveUser
}