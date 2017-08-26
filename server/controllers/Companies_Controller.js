'use strict'

const companiesModel = require('../models/Companies')
const categoriesModel = require('../models/Categories')
const serversModel = require('../models/Servers')
const jwt = require('jsonwebtoken')

function getCompany (req, res) {
	//se hace un find por id de la compañia
	companiesModel.findById(req.params.id).then(function (companyData) {
		console.log('Company found')
		// se crea una estructura solo con la info que se necesita
		res.status(200).json({
			id: companyData._id,
			name: companyData.name,
			token: companyData.token,
			categories: companyData.categories
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err)
		res.status(500).json({
			error: 'ERROR: ' + err
		})
	})
}

function getAll (req, res) {
	// se hace un find de todas las compañias
	companiesModel.find().then(function (companyList) {
		var companies = []
		//se hace un loop para agregar solo la info de las compañias que se necesita
		//TODO paginación
		companyList.forEach(function (companyObject) {
			companies.push({
				id: companyObject._id,
				name: companyObject.name,
				token: companyObject.token,
				categories: companyObject.categories
			})
		})
		return companies
	}).then(function (result) {
		// se retorna la info de la compañias
		res.status(200).json(result)
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: 'ERROR: ' + err
		})
	})
}

function saveCompany (req, res) {
	const data = new companiesModel({
		name: req.body.name
	})
	data.save().then(function (companySaved) { //se salva la compañia
		return companySaved
	}).then(function (companySaved) {
		//se crea un token para la compañia
		const tempToken = jwt.sign({id: companySaved._id}, 'b33dd00')
		const findBy = {
			_id: companySaved._id
		}
		const dataToUpdate = {
			token: tempToken
		}
		// se actualiza la compañia con el token
		return companiesModel.findOneAndUpdate(findBy, dataToUpdate).then(function (result) {
			console.log('Company Saved')
			// se crea una estructura solo con la info que se necesita
			res.status(200).json({
				id: result._id,
				name: result.name,
				token: tempToken,
				categories: result.categories
			})
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: 'ERROR: ' + err
		})
	})
}

function updateCompany (req, res) {
	const findBy = {
		_id: req.params.id
	}
	const data = {
		name: req.body.name
	}
	// se busca y se actualiza el nombre de la compañia, solo eso se permite de momento
	companiesModel.findOneAndUpdate(findBy, data).then(function (companyUpdated) {
		console.log('Company updated')
		// se crea una estructura solo con la info que se necesita
		res.status(200).json({
			id: companyUpdated._id,
			name: req.body.name,
			token: companyUpdated.token,
			categories: companyUpdated.categories
		});
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: 'ERROR: ' + err
		})
	})
}

function deleteCompany (req, res) {
	// se busca primero la información de la compañia populado con las categorias
	companiesModel.findById(req.params.id).populate('categories').then(function (companyData) {
		return companyData
	}).then(function (companyData) {
		var categoryIds = []
		// se llena un arreglo con los ids de las categorias de la compañia
		companyData.categories.forEach(function (categoryObject) {
			categoryIds.push(categoryObject._id)
		})
		return {companyData, categoryIds}
	}).then(function ({companyData, categoryIds}) {
		// se elimina todos los servidores que pertenezcan a todas las categorias que esten en el arreglo
		return serversModel.remove({category: {$in: categoryIds}}).then(function (serversDeleted) {
			return {companyData, categoryIds}
		})
	}).then(function ({companyData, categoryIds}) {
		// se elimina todas las categorias que este en el arreglo
		return categoriesModel.remove({_id: {$in: categoryIds}}).then(function (categoriesDeleted) {
			return companyData
		})
	}).then(function (companyData) {
		// por ultimo se borra la compañia
		return companiesModel.remove({_id: companyData._id}).then(function (companyDeleted) {
			console.log('Company deleted')
			// se retorna cierta información indicando que fue eliminada
			return res.status(200).json({
				id: companyData._id,
				message: "Compañia eliminada."
			})
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: 'ERROR: ' + err
		})
	})
}

module.exports = {
	getCompany,
	getAll,
	saveCompany,
	updateCompany,
	deleteCompany
}