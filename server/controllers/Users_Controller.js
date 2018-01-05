'use strict'

const userModel = require('../models/User')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const crypto = require('crypto')
const tools = require('../config/utils/tools')
const MailServices = require('../config/utils/mailServices')
const mailTemplates = require('../config/utils/emailTemplates')


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

	// se busca primero para ver si no existe
	return userModel.findOne({'username': req.body.email}).then(function (userData) {
		if (userData) {
			throw ('El nombre de usuario que intenta registrar ya se encuentra utilizado.')
		} else {
			return {}
		}
	}).then(function (userData) {
		const dataToSave = new userModel({
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
			password: encrypt(req.body.password),
			status: 0,
			verifiedAccount: 0,
			avatar: "",
			gender: req.body.gender
		})
		//se salva el usuario
		return dataToSave.save().then(function (userSaved) {
			return userSaved
		})
	}).then(function (userSaved) {
		//se crea un token para el usuario
		const findBy = {
			_id: userSaved._id
		}
		const tempToken = jwt.sign({id: userSaved._id}, 'b33dd00')
		const tempUserData = {
			token: tempToken
		}
		return userModel.update(findBy, tempUserData).then(function (userUpdated) {
			userSaved.token = tempToken
			return userSaved
		})
	}).then(function (userData) {
		var linkCode = new Date().getTime();
		MailServices.sendMail( {
			subject: "Confirmación de Correo Electrónico",
			to: userData.email,
			isText: false,
			msn: mailTemplates.accountConfirmation({
				name: userData.name,
				lastName: userData.lastName,
				encryptData: tools.encryptData(`${linkCode}_${userData.id}`, 'aes256', "b33dd00", "el link de confirmación de correo.")
			})
		}, function (resp) {
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
		});
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err)
		res.status(500).json({
			error: err
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

function validateAccount(req, res) {
	if (!req.query.u) {
		return res.render('accountConfirmation', {
			isValid: false,
			type: 1
		});
	}
	const dataDecrypted = tools.decryptData(req.query.u, "aes256", "b33dd00", "el link de reinicio de contraseña"),
		dataToArray = dataDecrypted.split('_'),
		linkCode = dataToArray[0] || "",
		userID = dataToArray[1] || "";

	userModel.findById(userID).then(function (userData) {
		if (!userData) {
			throw ({
				type: 2
			})
		} else if (userData.status === 1) {
			throw ({
				type: 3
			})
		}
		return userData
	}).then(function (userData) {
		const findBy = {
			_id: userData._id
		}
		const tempUserData = {
			status: 1
		}
		return userModel.update(findBy, tempUserData).then(function (userUpdated) {
			if (userUpdated.ok !== 1) {
				throw ({
					type: 4
				})
			}
			userData.status = 1
			return userData
		})
	}).then(function (userData) {
		return res.render('accountConfirmation', {
			isValid: true
		});
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err.type)
		return res.render('accountConfirmation', {
			isValid: false,
			type: err.type
		});
	})
}

function resendMail(req, res) {
	// se busca primero para ver si no existe
	return userModel.findById(req.body.id).then(function (userData) {
		if (!userData) {
			throw ('El usuario que intenta buscar no existe.')
		}
		return userData
	}).then(function (userData) {
		var linkCode = new Date().getTime();
		MailServices.sendMail( {
			subject: "Confirmación de Correo Electrónico",
			to: userData.email,
			isText: false,
			msn: mailTemplates.accountConfirmation({
				name: userData.name,
				lastName: userData.lastName,
				encryptData: tools.encryptData(`${linkCode}_${userData._id}`, 'aes256', "b33dd00", "el link de confirmación de correo.")
			})
		}, function (resp) {
			if (resp.code === 200) {
				res.status(200).json({ message: "Se envió un email al correo indicado, favor verificarlo para continuar!" });
			} else {
				res.status(500).json({ message: "No se pudo enviar el email, favor verificar el email si es el correcto!" });
			}
		});
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err)
		res.status(500).json({
			error: err
		})
	})
}

module.exports = {
	signup,
	login,
	saveUser,
	updateUser,
	validateAccount,
	resendMail
}