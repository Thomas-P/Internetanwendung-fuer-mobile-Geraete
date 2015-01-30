define('crudLokal',function(debug, xhr, eventHandler) {

	debug = debug.createConsole('controller/crudLokal');
	debug.log('module loaded');

	var _database
	var _version
	var _databaseReady
	var _eventHandling = true

	var _requiredObjectStores = ['topicView', 'object'];
	var _primary_keys = {
		'topicView' : 'title',
		'object' 	: '_id'
	}

	var _storeOperations = []
	var _eventsForStart = []
	var _isStarted = false

	// create an Request for the Database, with an closure
	;(function() {

		// create an indexDB Database IAM
		var openDataBaseHandler = function() {
			_database = this.result
			_databaseReady = true
			// do stored actions
			console.log(_storeOperations)
			var backup = _storeOperations
			backup.forEach(function(args) {
				crudControl.apply(this,args)
			})
			// and finish
			_isStarted = true
			backup = _eventsForStart
			_eventsForStart = []
			backup.forEach(function(callback) {
				if (callback)
					callback(true)
			})
		}
		var errorHandler = function() {
			console.error('could not open indexDB');
		}

		var upgradeHandler = function() {
			// check if the store has two objectStores
			_database = this.result;
			_requiredObjectStores.forEach(function(storeName) {
				// if stores doesn't exists
				if (!_database.objectStoreNames.contains(storeName)) {
					store = _database.createObjectStore(storeName, {
						keyPath: _primary_keys[storeName] || '_id'
					})
				}
			})

		}
		// open indexDB
		var request = indexedDB.open('IAM',1);
		request.onsuccess = openDataBaseHandler;
		request.onerror = errorHandler;
		request.onupgradeneeded = upgradeHandler;

	})();

	function crudControl(method, transactionData, callback) {
		if (!_databaseReady) {
			_storeOperations.push(arguments)
			return console.error('Database not ready, stored')
		} 
		if (!callback)
			var callback = function() {}
		var table = transactionData['table']
		var extension = transactionData['extension'] || ''
		var list = !!transactionData['list']
		var methodResult
		switch (String(method).toUpperCase()) {
			case 'POST': 	methodResult = 'create'; break;
			case 'GET': 	methodResult = 'read'; break;
			case 'PUT': 	methodResult = 'update'; break;
			case 'DELETE': 	methodResult = 'delete'; break;
			default: return console.error('Method not implemented')
		}

		var transaction, store
		if ( 'read' == methodResult ) {
			transaction = _database.transaction([table],'readonly')
		} else {
			transaction = _database.transaction([table],'readwrite')
		}
		store = transaction.objectStore(table)
		// send a request
		var request
		var data = transactionData['data'] || {}
		var noEvent = transactionData['noEvent'] || null
		// do i need this? yes
		var primary = _primary_keys[table] || '_id'
		var id = transactionData['id'] || null
		// set a request for the given method
		switch(methodResult) {
			case 'create':
			case 'update':
				if (id)
					data[primary] = id
				request = store.put(data)
				break
			case 'read':
				if (id)
					request = store.get(id)
				else if (list)
					request = store.openCursor();
				break
			case 'delete':
				if (id)  {
					request = store.delete(id)
					var deleteMessage = {}
					deleteMessage[primary] = id
				}
				break
		} // end switch
		if (!request)
			return callback(new Error('could not create a request to database'))
		if (list) {
			var listData = []
			var onSuccessList = function(event) {
				var result = event.target.result
				if(!!result == false) {
					// do a Callback
					callback(null,listData)
					if (!noEvent && _eventHandling) {
						var event = new eventHandler.customEvent( 'crud', methodResult, table + extension, methodResult == 'delete' ? [deleteMessage] : [data])
						eventHandler.notifyListeners(event);
					}
					return 
				}
				listData.push(result.value);
				result.continue();
			}
		}

		// request is set
		var onSuccess = function(event) {
			//console.log('onSuccess',event,transactionData,methodResult)
			var dbData = event.target.result
			if (!dbData)
				dbData = []
			else
				dbData = [dbData]
			dbData = methodResult == 'read' ? dbData : [data]
			callback(null,dbData)
			if (!noEvent && _eventHandling && dbData.length) {
				var event = new eventHandler.customEvent( 
					'crud', methodResult, table + extension, 
					methodResult == 'delete' ? [deleteMessage] : dbData )
				eventHandler.notifyListeners(event);
			}
		}

		var onError = function(event) {
			console.error('onError',event)
			callback(new Error('failure while interacting with indexedDB'))
		}
		if (list)
			request.onsuccess = onSuccessList
		else
			request.onsuccess = onSuccess
		request.onerror = onError
	}

	var operations = {}

	/**
	*	create a new topicView with a given title
	*/
	operations.createTopicView = function(title, callback) {
		var transactionData = {
			table : 'topicView',
			data : {
				title : title,
				contentItems : []	
			},
			id : title
		}
		crudControl('POST', transactionData ,callback)
	};

	/**
	* read a topicView
	* @param topicId -> title
	*/
	operations.readTopicView = function(topicId, callback) {
		var transactionData = {
			table : 'topicView',
			id : topicId
		}
		crudControl('GET', transactionData, callback);
	};

	/**
	* update a topicView
	* @param topicId -> title
	* @param data -> update data
	*/
	operations.updateTopicView = function(topicId, data, callback) {
		var transactionData = {
			table : 'topicView',
			data : data,
			id: topicId
		}
		if (!callback)
			var callback = function() {};
		crudControl('PUT', transactionData, callback);
	};


	/**
	* delete a topicView
	*
	*/
	operations.deleteTopicView = function(topicId, callback) {
		var transactionData = {
			table : 'topicView',
			id: topicId
		}
		if (!callback)
			var callback = function() {};

		crudControl('DELETE', transactionData, callback);
	};

	/** NJM3 (3) nur contentItems via REST einfügen **/
	operations.addContentItem = function (topicId,contentItem, callback) {
		var transactionData = {
			table : 'topicView',
			id: topicId,
			noEvent: true
		}
		// read the item, add the content, save it
		crudControl('GET', transactionData, function(err, data) {
			if (err || !data || !data[0])
				callback(err)
			var data = data[0]
			var contentItems = data.contentItems || []
			// set contentItems
			contentItems.push(contentItem)
			data.contentItems = contentItems
			transactionData['data'] = data
			transactionData.noEvent = false
			// save it
			crudControl('PUT',transactionData, callback)
		})
	}


	/** NJM3 (4) contentItems via REST leeren **/
	operations.removeContentItem = function (topicId,itemType, callback) {
		var transactionData = {
			table : 'topicView',
			id: topicId,
			noEvent: true
		}
		// read the item, add the content, save it
		crudControl('GET', transactionData, function(err, data) {
			if (err || !data || !data[0])
				callback(err)
			var data = data[0]
			var contentItems = data.contentItems || []
			// set contentItems
			var newItems = []
			contentItems.forEach(function(element) {
				if (element && element.type && element.type == itemType)
					return
				newItems.push(element)
			})

			data.contentItems = null;
			crudControl('PUT',transactionData, function() {
				data.contentItems = newItems
				transactionData['data'] = data
				transactionData.noEvent = false
				// save it
				crudControl('PUT',transactionData, callback)

			})
		})
	};

	/**
	*	create a new object with a given title
	*/
	operations.createObject = function(objectData, callback) {
		objectData['_id'] = new ObjectId().toString();
		var transactionData = {
			table : 'object',
			data : objectData
		}
		crudControl('POST', transactionData ,callback)
	};

	/**
	* read an object
	* @param objId -> id String
	*/
	operations.readObject = function(objId, callback) {
		var transactionData = {
			table : 'object',
			id : objId
		}
		crudControl('GET', transactionData, callback);
	};

	/**
	* update an object
	* @param objId -> _id
	* @param objectData -> update data
	*/
	operations.updateObject = function(objId, objectData, callback) {
		if (!objId)
			objId = new ObjectId().toString();
		var transactionData = {
			table : 'object',
			data : objectData,
			id: objId
		}
		if (!callback)
			var callback = function() {};
		crudControl('PUT', transactionData, callback);
	};


	/**
	* delete an object
	*
	*/
	operations.deleteObject = function(objId, callback) {
		var transactionData = {
			table : 'object',
			id: objId
		}
		if (!callback)
			var callback = function() {};

		crudControl('DELETE', transactionData, callback);
	};


	operations.readAllObject = function(callback) {
		var transactionData = {
			table : 'object',
			extension: 'List',
			list: true
		}
		crudControl('GET', transactionData, callback);
	};


	operations.crudStatus = function(callback) {
		if (_databaseReady)
			return callback(new Error('LocalDB is not ready.'))
		return callback(null,{
			version: '1.0',
			dbType: 'Local Storage via indexedDB'
		})
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
			return callback(true)
		_eventsForStart.push(callback)
	}

	return operations;
});