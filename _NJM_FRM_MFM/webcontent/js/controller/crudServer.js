define('crudServer',function(debug, xhr, eventHandler, helper) {

	var apiLink = '/api';

	debug = debug.createConsole('controller/crudServer');
	debug.log('module loaded');
	var _eventHandling = true
	var _eventsForStart = []
	var _isStarted = false
	var _restData = {}
	var createEvents = true

	function crudControl(method, uri, data, callback, target) {
		xhr(uri, {
			method: method,
			data: data || null
		}, function(err,data) {
			if (callback)
				callback(err,data);
			if (err)
				return;
			var methodResult
			switch (String(method).toUpperCase()) {
				case 'POST': 	methodResult = 'create'; break;
				case 'GET': 	methodResult = 'read'; break;
				case 'PUT': 	methodResult = 'update'; break;
				case 'DELETE': 	methodResult = 'delete'; break;
			}
			var oldId = uri.split('/');
			oldId = oldId[oldId.length-1];
			if (!createEvents)
				return
			// if objects are removed, than return old data to handle _id or title
			var event = new eventHandler.customEvent( 'crud', methodResult, target, methodResult == 'delete' ? [{_id : oldId}] : data)
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


	operations.updateObject = function(objId, obj, callback) {
		crudControl("PUT", apiLink + '/object/' + objId, obj, callback,'object');
	};


	operations.deleteObject = function(objId, callback) {
		crudControl("DELETE", apiLink + '/object/' + objId, null, callback,'object');
	};


	operations.readAllObject = function(callback) {
		crudControl("GET", apiLink + '/object/', null, callback,'objectList');
	};


	operations.crudStatus = function(callback) {
		xhr(apiLink,callback)
	}

	operations.disableEventHandler = function() {
		_eventHandling = false
	}

	operations.enableEventHandler = function() {
		_eventHandling = true
	}

	/**
	* dirty onStartHandler
	*/
	operations.onStart = function(callback) {
		if (_isStarted)
			return callback(!!_restData)
		_eventsForStart.push(callback)
	}

	operations.setEvents = function(doEvents) {
		createEvents = !!doEvents
	}

	helper.domReady(function() {
		xhr(apiLink,{},function(err,data) {
			_isStarted = true;
			_restData = data
			var backup = _eventsForStart;
			_eventsForStart = []
			backup.forEach(function(callback) {
				if (callback)
					callback(!!_restData)
			})
		})
	})

	return operations;

});