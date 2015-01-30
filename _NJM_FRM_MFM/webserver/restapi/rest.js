// url
var url 	 = require('url');
var mongojs  = require('mongojs');
var ObjectId = mongojs.ObjectId;
var JSONStream = require('JSONStream');
var domain = require('domain');
var formidable = require('formidable')
var fs = require('fs')

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};
}

/**
*	
*
* @usage require('rest')(apiLink,options);
* @param apiLink -> means a uri component, starting with "/" for example "/api"
* @param options {
*	collections: -> allowes to specify the used collections
*	databaseUrl: -> represents the database location
*	primaryKey: {
*		collectionName: key,
*		[...]	
*	}
*	
* }
*/
function createServer (apiLink,options) {
	// split link to an array, so you could remove the head of the uri
	var apiLinkArray = apiLink.split('/');
	apiLinkArray = removeEmptyArrayItems(apiLinkArray);
	

	// get options
	var options = options || {};

	var collections = options.collections || [];
	if (!Array.isArray(collections))
		collections = [];
	var databaseUrl = options.databaseUrl || 'mme2db';
	var primaryKey = options.primaryKey || {};


	/**
	*
	*/
	var readItem = function(parameter,callback) {
		// handle to get all collections
		if (void 0 == (parameter.id || void 0) ) 
			return readAllItems(parameter,callback);
		
		// get the collection 
		var collection = parameter.collection;
		
		// extract an set primary key
		var primaryKeyName;
		var id;
		
		if (!primaryKey[collection] || primaryKey[collection] == '_id') {
			
			id = new ObjectId(parameter.id);
			primaryKeyName = '_id';

		} else {

			id = parameter.id;
			primaryKeyName = primaryKey[collection];

		}

		var searchObject = {};
		searchObject[primaryKeyName] = id;

		
		database[collection].find(searchObject,function(err,data) {
			if (err || data.length == 0)
				return callback({
					errorNumber : 404,
					errorMessage: 'Not Found.'
				})
			return callback(null,data);
		});
	}


	/**
	*
	*/
	var readAllItems = function(parameter,callback) {

		// get the collection 
		var collection = parameter.collection;
		
		// get a resultStream
		var result = database[collection].find({}, function(err,result) {
			callback(null,result);
		});

	}


	/**
	*
	*/
	var createItem = function(parameter,callback) {

		var req = parameter.req;
		// @refactor content-type check moved to getData

		getData(req,function(err,data) {
			if (err) 
				return callback(err) // end callback

			// extract an set primary key
			var primaryKeyName;
			var id;
			
			if (!primaryKey[collection] || primaryKey[collection] == '_id') {
				
				id = data._id;
				data._id = new ObjectId(data._id);

			} else {

				primaryKeyName = primaryKey[collection];
				id = data[primaryKeyName];

			}

			parameter.id = id;

			database[collection].save(data, function(err, saved) {
				// return an error
				if (err || !saved) 
					return callback({
					errorNumber: 500,
					errorMessage: 'Could\'nt save the item.'
				}) // end callback
				// return saved
				if (1 == saved || 0== saved)
					return
						readItem(parameter,callback)
				callback(null, [saved]);
			}) // end database[...].save
		}) // end getData

	};



	/**
	*
	*/
	var updateItem = function(parameter, callback) {

		var req = parameter.req;

		if (void 0 == (parameter.id || void 0) ) 
			return callback({
				errorNumber: 400,
				errorMessage: 'Require an id for this operation.'
			}) // end callback

		// get the collection 
		var collection = parameter.collection;
		
		// extract an set primary key
		var primaryKeyName;
		var id;
		
		if (!primaryKey[collection] || primaryKey[collection] == '_id') {
			
			id = new ObjectId(parameter.id);
			primaryKeyName = '_id';


		} else {

			id = parameter.id;
			primaryKeyName = primaryKey[collection];

		}
		// create the object filter
		var searchObject = {};
		searchObject[primaryKeyName] = id;

		getData(req,function(err,data) {
			if (err) 
				return callback(err) // end callback

			// update a sub item of these item
			if (data['_id']) 
				delete data['_id'];
			var insert = {};

			if (parameter.data.length > 0) {
				var folder = parameter.data.shift();
				insert['$push'] = {};
				insert['$push'][folder] = data;

			} else {
				insert['$set'] = data;
			}

			// database query
			database[collection].update(searchObject, insert,{writeConcern:1}, function(err, updated) {
				if (err) 
					return callback({
						errorNumber: 500,
						errorMessage: 'Error occures while updating.'
					}) // end callback
				// return the full object
				readItem(parameter,callback);
			}) // end database[...].update
		}) // end getData
	}



	/**
	*
	*/
	var deleteItem = function(parameter, callback) {

		var req = parameter.req;
		var contentType = req.headers["content-type"];
		// end if [check content type]		

		if (void 0 == (parameter.id || void 0) ) 
			return callback({
				errorNumber: 400,
				errorMessage: 'Require an id for this operation.'
			}) // end callback

		// get the collection 
		var collection = parameter.collection;
		
		// extract an set primary key
		var primaryKeyName;
		var id;
		
		if (!primaryKey[collection] || primaryKey[collection] == '_id') {
			
			id = new ObjectId(parameter.id);
			primaryKeyName = '_id';

		} else {

			id = parameter.id;
			primaryKeyName = primaryKey[collection];

		}
		// create the object filter
		var searchObject = {};
		searchObject[primaryKeyName] = id;


		// delete a sub item of these item
		var deleteItem = {};
		if (parameter.data.length > 0) {
			var folder	= parameter.data.shift();
			var subId	= parameter.data.shift();
			if (!subId)
				return callback({
					errorNumber: 400,
					errorMessage: 'Require an sub id for this operation.'
				}) // end Callback

			deleteItem['$pull'] = {};
			deleteItem['$pull'][folder] = {
				type : subId
			};
			// database query
			database[collection].update(searchObject, deleteItem, function(err, updated) {
				if (err) 
					return callback({
						errorNumber: 500,
						errorMessage: 'Error occurd while deleting the sub item.'
					}) // end callback
				// return the full object
				readItem(parameter,callback);
			}) // end database[...].update

		} else {
			database[collection].remove(searchObject, function(err, deleted) {
				if (err) 
					return callback({
						errorNumber: 500,
						errorMessage: 'Error occurd while deleting the item.'
					}) // end callback
				// return an empty object
				callback(null,[deleted]);
			}); // end database[...].remove
		}
	} // end deleteItem
	


	var database = mongojs.connect(databaseUrl, collections);



	var doMethods = {
		'POST' 	: createItem,
		'GET' 	: readItem,
		'PUT'	: updateItem,
		'DELETE': deleteItem
	}


	// inner function that remember the api link and config
	function run(req,res) {

		// do handle multipart
		var contentType = String(req.headers["content-type"]);
		if ( contentType.startsWith('multipart/form-data') )
			return handleMultipart(req,function(err,result) {
				if (err) 
					return returnError(res,err.errorNumber || 500, err.errorMessage || 'Something went wrong.');
				res.writeHead(200, {
					'Content-Type' : 'application/json'
				})
				res.write(JSON.stringify(result));
				res.end();
			})

		// extract the request path
		var urlData = url.parse(req.url);
		// Decode each component
		var urlPath = decodeURIComponent(urlData.pathname).split('/');
		urlPath = removeEmptyArrayItems(urlPath);

		// check api link against reqLink
		for (var i = 0, len = apiLinkArray.length; i < len; i ++) {
			if (apiLinkArray[i] == urlPath[0])
				urlPath.shift();
			else 
				return returnError(res,400,'API link invalid');
		}
		if ( 0 == urlPath.length ) {
			// call to api
			result = {
				'name' : 'REST-API',
				'version' : '1.0',
				'collections' : collections,
				'primaryKey' : primaryKey
			}
			res.writeHead(200, {
					'Content-Type' : 'application/json'
				})
			res.write(JSON.stringify(result));
			res.end();
			return
		}
		// get the Collection
		collection = urlPath.shift()
		if (collections.indexOf(collection) === -1) {
			returnError(res,505,'Collection is not implemented');
			return null;
		}


		// setting up parameter for call
		var parameter = {
			req : req,
			res : res,
			data : urlPath,
			collection: collection,
			id : urlPath.shift()
		}

		/*
			possible actions
			collection known
			0	parameter -> give all item for collections back only GET
			1	parameter -> give one item for collections back 
			>1	parameter -> find a sub function for item -> use GET than method
			console.log('action by method', req._tmp.pathname);
			res.end();
		*/

		// Method check
		if (!req.method || !doMethods[req.method])
			returnError(res,405,'Method not Allowed');
		var method = doMethods[req.method];

		var myDomain = domain.create();

		myDomain.on('error', function(error) {
			console.log(error);
			return returnError(res, 500, 'Something went wrong.');
		})

		// call method for request
		myDomain.run(function() {
			method(parameter, function(err,result) {
				if (err) 
					return returnError(res,err.errorNumber || 500, err.errorMessage || 'Something went wrong.');
				res.writeHead(200, {
					'Content-Type' : 'application/json'
				})
				res.write(JSON.stringify(result));
				res.end();
			});
		})
	}


	return {
		run: run
	}
}


function removeEmptyArrayItems(array) {
	var result = [];
	if (!Array.isArray(array))
		return result;
	array.forEach(function(element) {
		if (element)
			result.push(element)
	})
	return result;
}



/**
*	returns an error handled with a message
*	@param res
*	@param errorNumber
*	@param errorMessage
*/
function returnError(res,errorNumber,errorString) {
	errorNumber = errorNumber >= 400 ? errorNumber : 500;
	var errorMessage = {
		'errorCode' : errorNumber,
		'errorMessage': errorString
	};
	res.writeHead( errorNumber, {
		'Content-Type' : 'application/json'
    });
	res.write(JSON.stringify(errorMessage));	
	res.end();
	return false;
}

function handleMultipart(request,callback) {
	/**
	*	using dirty hard coded links
	*/
	var form = new formidable.IncomingForm();

	fileDir = process.cwd() + '/../webcontent/upload/'
	var data = { }
	var parseError 

	form.on('fileBegin', function(name, file) {
    	// check images
    	if (!file || !file.type || !file.type.startsWith || !file.type.startsWith('image')) {
    		parseError = true
    		return
    	}
    	var id = file.path.split('_')
    	id = id[id.length-1]
    	var ext = file.name.split('.');
    	// NEW Filename
    	var fileName = id + '.' + ext[ext.length-1]
    	// set the right filename -> uploaddir
    	file.path = fileDir + fileName
    	// set a correct value for this file with the given name
    	data[name] = '/upload/' +fileName
    })

	form.on('file', function(name, file) {
		// remove a file, which is not an image
		if (!file || !file.type || !file.type.startsWith || !file.type.startsWith('image')){
			parseError = true
			fs.unlinkSync(file.path);
    	}
	});		


	form.parse(request, function(err, fields, files) {
		if (err || parseError) {
			return callback({
				errorNumber: 417,
				errorMessage: 'You could only upload images'
			}) // end callback			
		}

		for (var key in fields) {
			if (data[key])
				continue
			data[key] = fields[key]
		}

		return callback(null,[data]) // end callback

	});

}


function getData(request,callback) {
	var contentType = request.headers["content-type"];
	// otherwise requires application/json	
	if (contentType == null || contentType.indexOf('application/json') == -1) 
		return callback({
			errorNumber: 406,
			errorMessage: 'Content type must be application/json'
		}) // end callback
	// end if [check content type]		

	var allData = [];
	request.on('data',function(dataChunk) {
		allData.push(dataChunk);
	})

	request.on('end', function() {
		var data = JSON.parse(allData.join(''));
		callback(null,data);
	})
	// on error?
}



module.exports = createServer;