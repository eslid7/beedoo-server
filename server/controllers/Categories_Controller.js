'use strict'

const categoriesModel = require('../models/Categories')
const companiesModel = require('../models/Companies')
const serversModel = require('../models/Servers')

function getCategory (req, res) {
	//se hace un find por id de la categoria
	categoriesModel.findById(req.params.id).then(function (categoryData) {
		console.log('Company found')
		// se crea una estructura solo con la info que se necesita
		res.status(200).json({
			id: categoryData._id,
			name: categoryData.name,
			company: categoryData.company,
			servers: categoryData.servers
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
	// se hace un find de todas las categorias
	categoriesModel.find().then(function (categoryList) {
		var categories = []
		//se hace un loop para agregar solo la info de las categorias que se necesita
		//TODO paginación
		categoryList.forEach(function (categoryObject) {
			categories.push({
				id: categoryObject._id,
				name: categoryObject.name,
				company: categoryObject.company,
				servers: categoryObject.servers
			})
		})
		return categories
	}).then(function (result) {
		// se retorna la info de la categorias
		res.status(200).json(result)
	}).catch(function (err) {
		res.status(500).json({
			error: err
		})
	})
}

function saveCategory (req, res) {
	const data = new categoriesModel(req.body)
	data.save().then(function (categorySaved) { //se salva la categoria
		return categorySaved
	}).then(function (categoryData) {
		//se busca la info de la compañia para actualizarle la categoria
		return companiesModel.findById(categoryData.company).then(function (companyData) {
			return {categoryData, companyData}
		})
	}).then(function ({categoryData, companyData}) {
		var tempCategories = companyData.categories
		tempCategories.push(categoryData._id)
		const findBy = {
			_id: categoryData.company
		}
		const data = {
			categories: tempCategories
		}
		//se llena la info de la compañia y se actualiza sus categorias
		return companiesModel.update(findBy, data).then(function (companyUpdated) {
			return categoryData
		})
	}).then(function (categoryData) {
		console.log('Category Saved')
		// se responde que se guardo la categoria y se devuelve cierta info necesaria
		res.status(200).json({
			id: categoryData._id,
			name: categoryData.name,
			company: categoryData.company,
			servers: categoryData.servers
		})
	}).catch(function (err) {
		res.status(500).json({
			error: err
		})
	})
}

function updateCategory (req, res) {
	const findBy = {
		_id: req.params.id
	}
	const data = {
		name: req.body.name
	}
	// se busca y se actualiza el nombre de la categoria, solo eso se permite de momento
	categoriesModel.findOneAndUpdate(findBy, data).then(function (categoryUpdated) {
		console.log('Category updated')
		// se crea una estructura solo con la info que se necesita
		res.status(200).json({
			id: categoryUpdated._id,
			name: req.body.name,
			company: categoryUpdated.company,
			servers: categoryUpdated.servers
		});
	}).catch(function (err) {
		// en caso de error se devuelve el error
		res.status(500).json({
			error: err
		})
	})
}

function deleteCategory (req, res) {
	// se busca primero la información de la categoria
	categoriesModel.findById(req.params.id).then(function (categoryData) {
		return categoryData
	}).then(function (categoryData) {
		// se buscar la info de la compañia
		return companiesModel.findById(categoryData.company).then(function (companyData) {
			return {categoryData, companyData}
		})
	}).then(function ({categoryData, companyData}) {
		// se busca a ver si la categoria estan en el arreglo de categorias de la compañia
		var tempCategories = companyData.categories
		var indexCategory = tempCategories.indexOf(categoryData._id)
		// si esta se borra y se actualiza la compañia
		if (indexCategory > -1) {
			tempCategories.splice(indexCategory, 1)
			const findBy = {
				_id: categoryData.company
			}
			const data = {
				categories: tempCategories
			}
			//se llena la info de la compañia y se actualiza sus categorias
			return companiesModel.update(findBy, data).then(function (companyUpdated) {
				return categoryData
			})
		} else {
			// si no existe nada mas se retorna la info de la categoria
			return categoryData
		}
	}).then(function (categoryData) {
		// se elimina todos los servidores que pertenezcan a la categoria
		return serversModel.remove({category: categoryData._id}).then(function (serversDeleted) {
			return categoryData
		})
	}).then(function (categoryData) {
		// se elimina la categoria
		return categoriesModel.remove({_id: categoryData._id}).then(function (categoriesDeleted) {
			console.log('Category deleted')
			// se retorna cierta información indicando que fue eliminada
			return res.status(200).json({
				id: categoryData._id,
				message: "Categoria eliminada."
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
	getCategory,
	getAll,
	saveCategory,
	updateCategory,
	deleteCategory
}