define('objectView',function(debug,crud,helper,eventHandler,topicView) {
	console.log('topic',topicView)
	debug = debug.createConsole('controller/objectView');
	debug.log('module loaded');

	var objectData = null;

	/** NJM2 (6) Objekt anzeigen**/
	function showObject() {
		var objData = objectData;
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
	 	image.dataset.description = objData.description || 'Keine Beschreibung angegeben.';
	 	element.style.visibility = 'visible';

	 	var figcaption = element.querySelector('figcaption');
	 	if (!figcaption)
	 		return;
	 	figcaption.textContent = objData.title || '';
	}


	// adding eventListener for buttons
	var addEvents = function() {
		var button;
		button = document.getElementById('createObjectAction');
		if (button) {
			// create
			button.addEventListener('click',function(event) {
				event.preventDefault();
				if (objectData)
					return alert('Object already exists');
				objectTemplate = {
					src: null,
					title: 'Neues Objekt',
					description: 'Dies ist ein neues Objekt, dessen Werte noch befüllt werden müssen.'
				};
				crud.createObject(objectTemplate,function(err,data) {
					if (err)
						return alert('Could not create object.');
					/**
					* NJM3 (1) erstelle ein Objekt und füge es der topicView an.
					*/
					objectData = data[0];
					var contentItem = {
						type: 'objekt',
						renderContainer: 'column_left',
						objectId: objectData._id
					}
					var tViewObject = topicView.getTopicView();
					if (!tViewObject.title) {
						return alert('No topic view set.');
					}
					crud.addContentItem(tViewObject.title,contentItem);
				}) // end crud.createObject

			}.bind(this));// end button.addEventListener
		}
		button = document.getElementById('updateObjectAction');
		if (button) {
			// change
			button.addEventListener('click',function(event) {
				event.preventDefault();
				crud.updateObject(objectData,function(err,data) {
					if (err)
						alert('The object element could not be updated!');
					objectData = data[0];
				}); // end crud.updateObject
			}.bind(this));
		}

		button = document.getElementById('deleteObjectAction');
		if (button) {
			// delete
			button.addEventListener('click', function(event) {
				event.preventDefault();
				if (objectData._id && confirm('Delete these object?')) {

					crud.deleteObject(objectData._id,function(err,data) {
						if (err) 
							return alert('Could not delete object');
						var tViewObject = topicView.getTopicView();
						crud.removeContentItem(tViewObject.title,'objekt',function(err,data) {
							// test
							console.log('T',arguments);
						})
					});
				}
			}.bind(this))
		}
	}


	

	/**
	*	display the content of topicView
	*/
	var topicViewChange = function(event) {
		console.log('Got a new topicView',event);
		var topicView = event.data[0];
		var objectConnector = null;
		if (topicView && topicView.contentItems && Array.isArray(topicView.contentItems)) {
			for (var i=0, len= topicView.contentItems.length; i<len; i++) {
				objectConnector = topicView.contentItems[i];
				if (objectConnector.type && objectConnector.type == 'objekt') 
					break;
				objectConnector = null;
			} // end for
			if (objectConnector) {
				crud.readObject(objectConnector.objectId,function(err,data) {

					// store object 
					objectData = data[0];
					showObject() // show object
				})// end crud.readObject
			} // find an objectConnector
		} // end topicView check
		
	}
	// create an event for displayContent
	eventHandler.addEventListener(eventHandler.customEvent("crud", "create|read|update", "topicView"),topicViewChange.bind(this));

	// initialize when dom Ready
//	helper.domReady(initialize);
	helper.domReady(addEvents);

	

});