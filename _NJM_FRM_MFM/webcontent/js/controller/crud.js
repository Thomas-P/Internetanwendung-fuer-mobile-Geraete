define('crud',function(debug, xhr, eventHandler) {

	var apiLink = 'api';

	debug = debug.createConsole('crud');
	debug.log('module loaded');

	function crudControl(method, uri, data, callback, target) {
		xhr(uri, {
			method: method,
			data: data || null
		}, function(err,data) {
			if (callback)
				callback(err,data);
			if (err)
				return
			var methodResult
			switch (String(method).toUpperCase()) {
				case 'POST': 	methodResult = 'create'; break;
				case 'GET': 	methodResult = 'read'; break;
				case 'PUT': 	methodResult = 'update'; break;
				case 'DELETE': 	methodResult = 'delete'; break;
			}
			var event = new eventHandler.customEvent( 'crud', methodResult, target, data)
			eventHandler.notifyListeners(event);
		});
	}

	var operations = {};


	/**
	*
	*
	*/
	operations.createTopicView = function(title, callback) {

		crudControl("POST",apiLink + '/topicview/',{
			title : title,
			contentItems : []
		},callback,'topicView');

	};


	/**
	*
	*
	*/
	operations.readTopicView = function(topicId, callback) {
		crudControl("GET", apiLink + '/topicview/' + topicId, null, callback,'topicView');
	};


	/**
	*
	*
	*/
	operations.updateTopicView = function(topicId, update, callback) {
		if (!callback)
			callback = function() {};
		crudControl("PUT", apiLink + '/topicview/' + topicId, update, callback,'topicView');
	};


	/**
	*
	*
	*/
	operations.deleteTopicView = function(topicId, callback) {
		if (!callback)
			callback = function() {};
		crudControl("DELETE", apiLink + '/topicview/' + topicId, null, callback,'topicView');
	};


	/** NJM3 (3) nur contentItems via REST einfügen **/
	operations.addContentItem = function (topicId,contentItem, callback) {

		// for updating, we identify the topicview passing the id and then only pass the attributes to be updated
		crudControl("PUT", apiLink + '/topicview/' + topicId + '/contentItems/', contentItem, callback,'contentItems');
	};

	/** NJM3 (4) contentItems via REST leeren **/
	operations.removeContentItem = function (topicId,itemType, callback) {

		// for updating, we identify the topicview passing the id and then only pass the attributes to be updated
		crudControl("DELETE", apiLink + '/topicview/' + topicId + '/contentItems/' + itemType , null, callback,'contentItems');
	};


	/*
	* these functions need to be implemented for the njm exercises
	*/
	operations.createObject = function(obj, callback) {
		crudControl("POST", apiLink + '/object/', obj, callback,'object');
	};


	operations.readObject = function(objId, callback) {
		crudControl("GET", apiLink + '/object/' + objId, null, callback,'object');
	};


	operations.updateObject = function(obj, callback) {
		crudControl("PUT", apiLink + '/object/' + obj.id, obj, callback,'object');
	};


	operations.deleteObject = function(objId, callback) {
		crudControl("DELETE", apiLink + '/object/' + objId, null, callback,'object');
	};


	operations.readAllObject = function(callback) {
		crudControl("GET", apiLink + '/object/', null, callback,'object');
	};

	/**
	*	add an existing object to topicId or create an object and add them to topicId
	*	@param topicId the topicId of the topic object
	*	@param obj an object reference for a content_item
	*   @param callback fires when done
	*/
	operations.addObject = function(topicId, obj, callback) {
		/**
		*	test if an object exists
		*	if, then add it to topicId
		*	if not, create them and add it to topicId
		*/
		var getObjectCallback = function(err,object) {
			if (!err)
				return addContentItem(topicId,obj,callback);
			// create the object
			operations.createObject(obj,function(err,object) {
				if (err)
					return callback(err);
				operations.addContentItem(topicId,object,callback);
			})
		}

		if (!obj)
			return;

		// has an id
		if (obj._id) {
			// 
			return operations.readObject(obj_id,getObjectCallback);
		}

	}

	return operations;

});