define('crud',function(debug, xhr, test) {

	debug = debug.createConsole('crud');
	debug.log('module loaded');

	function crudControl(method, uri, data, callback) {
		xhr(uri, {
			method: method,
			data: data || null
		}, callback);
	}

	var operations = {};


	/**
	*
	*
	*/
	operations.createTopicView = function(topicId, title, callback) {
		crudControl("POST","http2mdb/topicviews",{
			topicid : topicId,
			title : title,
			content_items : []
		},callback);

	};


	/**
	*
	*
	*/
	operations.readTopicview = function(topicId, callback) {
		crudControl("GET", "http2mdb/topicviews/" + topicId, null, callback);
	};


	/**
	*
	*
	*/
	operations.updateTopicview = function(topicId, update, callback) {
		if (!callback)
			callback = function() {};
		crudControl("UPDATE", "http2mdb/topicviews/" + topicId, update, callback);
	};


	/**
	*
	*
	*/
	operations.deleteTopicview = function(topicId, callback) {
		if (!callback)
			callback = function() {};
		crudControl("DELETE", "http2mdb/topicviews/" + topicId, null, callback);
	};


	/** NJM3 (3) nur content_items via REST einfügen **/
	operations.addContentItem = function addContentItem(topicId,contentItem, callback) {

		// for updating, we identify the topicview passing the id and then only pass the attributes to be updated
		crudControl("PUT", "http2mdb/topicviews/" + topicId + "/content_items", contentItem, function(err,updated) {
			if (err)
				return callback(err);
			callback(updated != 1, updated == 1);
		});
	};

	/** NJM3 (4) content_items via REST leeren **/
	operations.removeContentItem = function addContentItem(topicId,itemType, callback) {

		// for updating, we identify the topicview passing the id and then only pass the attributes to be updated
		crudControl("DELETE", "http2mdb/topicviews/" + topicId + "/content_items/" + itemType , null, function(err,updated) {
			if (err)
				return callback(err);
			callback(updated != 1, updated == 1);
		});
	};


	/*
	* these functions need to be implemented for the njm exercises
	*/
	operations.createObject = function(obj, callback) {
		crudControl("POST", "http2mdb/objects/", obj, callback);
	};


	operations.readObject = function(objId, callback) {
		crudControl("GET", "http2mdb/objects/" + objId, null, callback);
	};


	operations.updateObject = function(obj, callback) {
		crudControl("PUT", "http2mdb/objects/" + obj.id, obj, callback);
	};


	operations.deleteObject = function(objId, callback) {
		crudControl("DELETE", "http2mdb/objects/" + objId, null, callback);
	};


	operations.readAllObject = function(callback) {
		crudControl("GET", "http2mdb/objects/", null, callback);
	};


	return operations;

});