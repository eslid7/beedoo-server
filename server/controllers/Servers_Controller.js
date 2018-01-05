'use strict'

const serversModel = require('../models/Servers')
const categoriesModel = require('../models/Categories')

function getServer (req, res) {
	//se hace un find por id del servidor
	serversModel.findById(req.params.id).then(function (serverData) {
		console.log('Server found')
		// se crea una estructura solo con la info que se necesita
		res.status(200).json({
			id: serverData._id,
			environment: serverData.environment,
			uri: serverData.uri,
			port: serverData.port,
			https: serverData.https,
			time: serverData.time,
			path: serverData.path
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		console.log('ERROR: ' + err)
		res.status(500).json({
			error: err
		})
	})
}

function getAll (req, res) {
	console.log('Definido?', typeof req.query.environment)
	const filters = {}
	if (typeof req.query.environment !== 'undefined') {
		filters.environment = req.query.environment
	}
	// se hace un find de todos los servidores
	serversModel.find(filters).then(function (serverList) {
		var servers = []
		//se hace un loop para agregar solo la info de los servidores que se necesita
		//TODO paginación
		serverList.forEach(function (serverObject) {
			servers.push({
				id: serverObject._id,
				environment: serverObject.environment,
				uri: serverObject.uri,
				port: serverObject.port,
				https: serverObject.https,
				time: serverObject.time,
				path: serverObject.path
			})
		})
		return servers
	}).then(function (result) {
		// se retorna la info de los servidores
		res.status(200).json(result)
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: err
		})
	})
}

function saveServer (req, res) {
	const data = new serversModel(req.body)
	data.save().then(function (serverSaved) { //se salva el servidor
		return serverSaved
	}).then(function (serverData) {
		//se busca la info de la categoria para actualizarle los servidores
		return categoriesModel.findById(serverData.category).then(function (categoryData) {
			return {serverData, categoryData}
		})
	}).then(function ({serverData, categoryData}) {
		var tempServers = categoryData.servers
		tempServers.push(serverData._id)
		const findBy = {
			_id: serverData.category
		}
		const data = {
			servers: tempServers
		}
		//se llena la info de la categoria y se actualiza sus servers
		return categoriesModel.update(findBy, data).then(function (categoryUpdated) {
			return serverData
		})
	}).then(function (serverData) {
		console.log('Server Saved')
		// se crea una estructura solo con la info que se necesita
		res.status(200).json({
			id: serverData._id,
			environment: serverData.environment,
			uri: serverData.uri,
			port: serverData.port,
			https: serverData.https,
			time: serverData.time,
			path: serverData.path
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: err
		})
	})
}

function updateServer (req, res) {
	const findBy = {
		_id: req.params.id
	}
	const data = {
		environment: req.body.environment,
		uri: req.body.uri,
		port: req.body.port,
		https: req.body.https,
		time: req.body.time,
		path: req.body.path
	}
	// se busca y se actualiza la info del servidor
	serversModel.findOneAndUpdate(findBy, data).then(function (serverUpdated) {
		console.log('Server updated')
		// se crea una estructura solo con la info que se necesita
		res.status(200).json({
			id: serverUpdated._id,
			environment: req.body.environment,
			uri: req.body.uri,
			port: req.body.port,
			https: req.body.https,
			time: req.body.time,
			path: req.body.path
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: err
		})
	})
}

function deleteServer (req, res) {
	// se busca primero la información del servidor
	serversModel.findById(req.params.id).then(function (serverData) {
		return serverData
	}).then(function (serverData) {
		// se buscar la info de la categoria
		return categoriesModel.findById(serverData.category).then(function (categoryData) {
			return {serverData, categoryData}
		})
	}).then(function ({serverData, categoryData}) {
		// se busca a ver si el servidor estan en el arreglo de servidores de la categoria
		var tempServers = categoryData.servers
		var indexServers = tempServers.indexOf(serverData._id)
		// si esta se borra y se actualiza la categoria
		if (indexServers > -1) {
			tempServers.splice(indexServers, 1)
			const findBy = {
				_id: serverData.category
			}
			const data = {
				servers: tempServers
			}
			//se llena la info de la categoria y se actualiza sus servidores
			return categoriesModel.update(findBy, data).then(function (categoryUpdated) {
				return serverData
			})
		} else {
			// si no existe nada mas se retorna la info del servidor
			return serverData
		}
	}).then(function (serverData) {
		// se elimina el servidor
		return serversModel.remove({_id: req.params.id}).then(function (serverDeleted) {
			console.log('Server deleted')
			// se retorna cierta información indicando que fue eliminado
			return res.status(200).json({
				id: req.params.id,
				message: "Servidor eliminado."
			})
		})
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: err
		})
	})
}

function testPromises2(req, res) {
	// Promise.all ejecuta las promesas al mismo tiempo
	return Promise.all([
			serversModel.find(),
			serversModel.findById('595b02bfeb8cfc59979a4aa6')
		])
		.then(function ([result1, result2]) {
			res.status(200).json({ result1, result2 })
		})
}

function testPromises(req, res) {
	serversModel
		.find()
		.then(function (result) {
			return serversModel.findById(result[1]._id)
			.then(function (result2) {
				return { result, result2 }
			})
		})
		.then(function ({ result, result2 }) {
			return serversModel.findById(result[2]._id)
			.then(function (result3) {
				res.status(200).json({ result, result2, result3 })
			})
		})
		.catch(function (err) {
			res.status(500).json({
				error: err
			})
		})
}

module.exports = {
	getServer,
	getAll,
	saveServer,
	updateServer,
	deleteServer,
	testPromises,
	testPromises2,
}