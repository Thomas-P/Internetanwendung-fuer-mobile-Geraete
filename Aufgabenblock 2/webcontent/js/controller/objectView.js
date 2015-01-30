define('objectView',function(debug,crud,helper,eventHandler,topicView) {

	debug = debug.createConsole('controller/objectView');
	debug.log('module loaded');

	var _objectData = null;
	var _topicView = null;

	/**
	*	create an object
	*/
	function createObject(objectData) {
		if (!_topicView) {
			return alert('Sorry, no topicView set.')
		}
		crud.createObject(objectData,function(err,data) {
			if (err)
				return alert('Could not create object.');
			/**
			* NJM3 (1) erstelle ein Objekt und füge es der topicView an.
			*/
			_objectData = data[0];
			showObject();
			var contentItem = {
				type: 'objekt',
				renderContainer: 'column_left',
				objectId: _objectData._id
			}
			var tViewObject = topicView.getTopicView();
			if (!tViewObject.title) {
				return alert('No topic view set.');
			}
			crud.addContentItem(tViewObject.title,contentItem);
		}) // end crud.createObject
	} // end createObject

	/** NJM2 (6) Objekt anzeigen**/
	function showObject() {
		console.log('NJM2 (6) showObject',_objectData);
		var objData = _objectData;
		var element = document.getElementById('objekt');
		if (!element) {
	 		console.error('Could\'nt find "Zeitdokumente" element.');
	 		return;
	 	}
	 	if (!objData)
	 		return element.style.visibility = 'hidden';

	 	var image = element.querySelector('img');
	 	image.dataset.backupUrl = objData.src_bak || void 0;
	 	image.alt = objData.title || 'an image';
	 	image.src = objData.src || '';
	 	image.onerror = function() {
	 		this.style.display = 'none'
	 	}
	 	image.onload = function() {
	 		this.style.display = 'block'
	 	}
	 	image.dataset.description = objData.description || 'Keine Beschreibung angegeben.';
	 	element.style.visibility = 'visible';

	 	var figcaption = element.querySelector('figcaption');
	 	if (!figcaption)
	 		return;
	 	figcaption.textContent = objData.title || '';
	}

	/**
	*	create action listener for delete action
	*/
	function deleteObjectAction(button) {
		if (button) {
			// delete
			button.addEventListener('click', function(event) {
				event.preventDefault();
				// FRM2 (10) only if object exists
				if (!_objectData || !_objectData._id) {
					return alert('No object!');
				}
				if (confirm('Delete these object?')) {

					crud.deleteObject(_objectData._id,function(err,data) {
						if (err) 
							return alert('Could not delete object');
						var tViewObject = topicView.getTopicView();
						/* NJM3 (4) */
						crud.removeContentItem(tViewObject.title,'objekt',function(err,data) {
							_objectData = null;
							showObject();
						})
					});
				}
			})
		}
	} // end deleteButtonAction

	// adding eventListener for buttons
	var addEvents = function() {
		var button;
		button = document.getElementById('createObjectAction');
		if (button) {
			// create
			button.addEventListener('click',function(event) {
				event.preventDefault();
				if (_objectData)
					return alert('Object already exists');
				objectTemplate = {
					src: null,
					title: 'Neues Objekt',
					description: 'Dies ist ein neues Objekt, dessen Werte noch befüllt werden müssen.'
				};
				createObject(objectTemplate);
			}.bind(this));// end button.addEventListener
		}
		button = document.getElementById('updateObjectAction');
		if (button) {
			// change
			button.addEventListener('click',function(event) {
				event.preventDefault();
				if (!_objectData || !_objectData._id)
					return alert('No Object!');
				crud.updateObject(_objectData._id,_objectData,function(err,data) {
					if (err)
						alert('The object element could not be updated!');
					_objectData = data[0];
					showObject();
				}); // end crud.updateObject
			}.bind(this));
		}

		button = document.getElementById('deleteObjectButton');
		deleteObjectAction(button);
		button = document.getElementById('deleteObjectAction');
		deleteObjectAction(button);

		// moving formObject to editView
	}


	/**
	*	display the content of _topicView
	*/
	var topicViewChange = function(event) {
		// Object from _topicView event, so no array
		_topicView = null;
		if (event && event.data && event.data[0])
			_topicView = event.data[0];
		var objectConnector = null;
		if (_topicView && _topicView.contentItems && Array.isArray(_topicView.contentItems)) {
			for (var i=0, len= _topicView.contentItems.length; i<len; i++) {
				objectConnector = _topicView.contentItems[i];
				if (objectConnector.type && objectConnector.type == 'objekt') 
					break;
				objectConnector = null;
			} // end for
			if (objectConnector) {
				crud.readObject(objectConnector.objectId,function(err,data) {
					// could not read the topic
					if (err) {
						console.error('Object for topic view does not exists anymore.')
						crud.removeContentItem(_topicView.title,'objekt',function(err,data) {
							// do something?
							console.log('remove them')
						})
					}
					// store object 
					_objectData = data[0];
					showObject() // show object
				})// end crud.readObject
			} // find an objectConnector
		} // end _topicView check
		
	}
	// create an event for displayContent
	eventHandler.addEventListener(eventHandler.customEvent("crud", "create|read|update", "topicView"),topicViewChange);

	var objectChange = function(event) {
		var result = event.data
		if (!result || !result[0])
			return 
		_objectData = result[0]
		showObject()
	}
	eventHandler.addEventListener(eventHandler.customEvent("crud", "create|read|update|delete", "object"),objectChange);

	// initialize when dom Ready
	helper.domReady(addEvents);

	return {
		createObject : createObject,
		showObject: showObject
	}
	

});