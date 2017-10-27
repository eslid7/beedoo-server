﻿'use strict'

const userModel = require('../models/User')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const crypto = require('crypto')


function updateUser(req, res) {
	console.log('here')
	userModel.update(
		{ _id: "59cebae00016b06026ce9eb4" },
		{ $set: {
			token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5Y2ViYWUwMDAxNmIwNjAyNmNlOWViNCJ9.ZJVI_d4c4gC4JTd-Teiswx--4sWAa-TjYTwMKxwdM7Y"
		}}
	);
}


function signup (req, res) {
	console.log(req.body.password)
	const encryptPass = encrypt(req.body.password)
	const tempUserData = {
		username: req.body.email,
		name: req.body.name,
		lastName: req.body.lastName,
		secondLastName: req.body.secondLastName,
		createdAt: moment(new Date()).format('DD-MMM-YYYY'),
		updateAt: moment(new Date()).format('DD-MMM-YYYY'),
		email: req.body.email,
		facebook: 0,
		google: 0,
		phone: req.body.phone,
		password: encryptPass,
		status: 1,
		verifiedAccount: 1,
		avatar: "",
		gender: req.body.gender
	}
	// se busca primero para ver si no existe
	return userModel.findOne({'username': tempUserData.username, 'email': tempUserData.email}).then(function (userData) {
		return userData
	}).then(function (userData) {
		if (userData) {
			return userData
		} else {
			console.log("aqui")
			//se crea un token para el usuario
			const tempToken = jwt.sign({id: tempUserData.username}, 'b33dd00')
			tempUserData.token = tempToken
			const dataToSave = new userModel(tempUserData)
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
		res.status(200).json({
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
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err)
		res.status(500).json({
			error: 'ERROR: ' + err
		})
	})
}

function login (req, res) {

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

function encrypt(password) {
	const shasum = crypto.createHash('sha256')
	shasum.update(password)
	return shasum.digest('hex')
}

module.exports = {
	signup,
	login,
	saveUser,
	updateUser
}