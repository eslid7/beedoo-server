'use strict'

var Promise = require('bluebird')
const jwt = require('jsonwebtoken')

const companiesModel = require('../models/Companies')
const categoriesModel = require('../models/Categories')
const serversModel = require('../models/Servers')
const { extractToken, verify } = require('../config/utils/token')

function getCompany (req, res) {
	extractToken(req)
	.then((token) => verify(token).then(tokenDecoded => tokenDecoded))
	.then(token => {
		console.log('Token decodificado', token.id)
		companiesModel.findOne({_id:req.params.id, user:token.id}).then(function (companyData) {
			if (companyData) {
				res.status(200).json({
					id: companyData._id,
					name: companyData.name,
					token: companyData.token,
					categories: companyData.categories
				})
			} else {
				console.log('companyData ', companyData)
				throw new Error('Company not found')
			}
		}).catch((err) => {
			res.status(500).json({
				error: 'ERROR: ' + err
			})
		})
	})
	.catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err)
		res.status(500).json({
			error: err
		})
	})
}

function getAll (req, res) {
	// se hace un find de todas las compañias
	companiesModel.find().populate("categories").then(function (companyList) {
		var companies_List = [];
		//se hace un loop para agregar solo la info de las compañias que se necesita
		//TODO paginación

		return Promise.map(companyList, function(companies) {

			return Promise.map(companies.categories, function (category) {
				//console.log('category._id ',category._id);
				return serversModel.find({ category: category._id })
				.then(function(servers){
					//console.log('server 1',servers);
					return servers;
				});
			}).then(function (serversToLoad) {
				//console.log('server 2',serversToLoad);
				companies.categories.servers = [];
				serversToLoad.forEach(function (serverList) {
					serverList.forEach(function(server) {
						if (server) {
								//companies.categories.servers = [];
								companies.categories.servers.push({ id :server._id,environment : server.environment,
									uri: server.uri, port : server.port ,
									https :server.https , time :server.time, path :server.path , category :server.category});
							}

					});
				});
				//console.log('companies categories ', companies);
				return companies;
			});
		}).each(function (companies) {
			companies_List.categories =[]

			if (companies) {
				companies.categories.forEach(function (categori) {
					if (categori ) {
						var serversList =[];
						companies.categories.servers.forEach(function(element){
							//console.log('element.category  ', element.category);
							//console.log('categori._id  ', categori._id);
							if(element.category.toString() == categori._id.toString()){
								//console.log('equalllllllLLllllllllllllllll  ');
								serversList.push(element)
							}
						});

						//console.log(' lisatdo de servers ', companies.categories.servers);
						companies_List.categories.push({ id :categori._id,name : categori.name, company: categori.company,
							server: serversList });
						//companies.categories.servers
					}
				});
				companies_List.push({
			 		id: companies._id,
			 		name: companies.name,
			 		token: companies.token,
			 		categories : companies_List.categories
			 	});
			}
			return companies_List;
		}).then(function (companies) {
			return companies_List;
		})

	}).then(function (result) {
		// se retorna la info de la compañias
		res.status(200).json(result)
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: err
		})
	})
}

function saveCompany (req, res) {
	const data = new companiesModel(req.body)
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
				user: req.body.user,
				categories: result.categories
			})
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: err
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
			error: err
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
			error: err
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