define('topicView',function(debug,crud,helper,eventHandler) {

	debug = debug.createConsole('controller/topicView');
	debug.log('module loaded');

	var topicView = {};

	var getTopicView = function() {
		var tp = helper.clone(topicView);
		return tp;
	}

	// adding eventListener for buttons
	var addEvents = function() {
		var button;
		button = document.getElementById('createTopicViewAction');
		if (button) {
			// create
			button.addEventListener('click',function(event) {
				event.preventDefault();
				alert('This button isn\'t need anymore. A topicView will be created on site load.');
			}.bind(this));
		}
		button = document.getElementById('updateTopicViewAction');
		if (button) {
			// change
			button.addEventListener('click',function(event) {
				event.preventDefault();
				crud.updateTopicView(topicView.title || '',topicView,function(err,data) {
					if (err)
						alert('The topicview element could not be updated!');
				});
			}.bind(this));
		}

		button = document.getElementById('deleteTopicViewAction');
		if (button) {
			// delete
			button.addEventListener('click', function(event) {
				event.preventDefault();
				if (confirm('Delete these topic view?')) {
					crud.deleteTopicView(topicView.title);
				}
			}.bind(this))
		}
	}


	

	/**
	*	display the content of topicView
	*/
	var displayContent = function(event) {
		if (event.type == 'delete') {
			alert('topic view deleted.')
			document.location.href = '/'
			return;
		}
		topicView = event.data[0] || {};
		var topicTitle = document.getElementById('topicTitle');

		if (topicTitle) {
			topicTitle.textContent = topicView.title || 'Title is not set.'
		}
	}
	// create an event for displayContent
	eventHandler.addEventListener(eventHandler.customEvent("crud", "create|read|update|delete", "topicView"),displayContent.bind(this));

	/**
	*	load the topicView object or create them, if it doesn't exists
	*	topicView object will be filled by displayContent
	*/
	var initialize = function() {
		var topicTitle = helper.getQueryVariable('topic');
		if (!topicTitle) {
			alert('No topic id for document set');
			document.location.href = '/';
		}
		crud.readTopicView(topicTitle,function(err,data) {
			// exists an error, or empty data
			if (err || !data[0]) 
				// not exists, create them
				return crud.createTopicView(topicTitle,function(err,data) {
					if (err || !data[0]) {
						// couldn't create, go back to title list
						alert('could not read topicview');
						document.location.href = '/';
					}
				}) // end crud.createTopicView
		}) // end crud.readTopicView
	}


	// initialize when DOM Ready
	helper.domReady(initialize);
	helper.domReady(addEvents);

	return {
		getTopicView: getTopicView
	}

});