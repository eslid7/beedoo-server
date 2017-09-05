const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

const companiesSchema = Schema({
	token: 'String',
	name: 'String',
	categories: [{type: ObjectId, ref: 'categories'}],
	user: {type: ObjectId, ref: 'users'}
});

const Companies = mongoose.model('companies', companiesSchema);

module.exports = Companies;