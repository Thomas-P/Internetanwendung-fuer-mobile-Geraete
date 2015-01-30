define('mainView',function(debug,navigation,eventHandler) {

	debug = debug.createConsole('mainViewController');
	debug.log('module loaded');
	// Define Elements
	var naviBackButton;
	// all elements, which switch 
	var actionBarSwitches = [];
	var showVideo;


	/**
	* Event Listener for the Back Button
	*
	*/
	var navigationGoBackEvent = function(event) {
		event.preventDefault();
		if (showVideo)
			return;
		navigation.previousView();
	};

	/**
	*	Event function to switch the actionbar between 
	*	objects and topics
	*/
	var toggleActionBar = function(event) {
		event.preventDefault();
		// use all elements in the array to toggle class hidden
		actionBarSwitches.forEach(function(element){
			element.classList.toggle("hidden");
		});
	};



	/**
	*	Requirement of MME3
	*	Setting the value of showVideo, so we could handle,
	*	that the back function won't switch back to the list
	*/
	eventHandler.addEventListener(eventHandler.customEvent('video','stop'),function() {
		showVideo = false;
		console.log('video removed')
	});
	eventHandler.addEventListener(eventHandler.customEvent('video','start'),function() {
		console.log('show a video')
		showVideo = true;
	});



	// Call functions
	document.addEventListener('DOMContentLoaded',function() {
		// Navigation
		var naviBackButton = document.querySelector('.navigation-back');
		if (naviBackButton) 
			naviBackButton.addEventListener('click',navigationGoBackEvent);
		// ActionsBar Switch
		var actionbar_title = document.getElementById("actionbar_title");
		var actionbar_object = document.getElementById("actionbar_object");
		actionBarSwitches.push(actionbar_title,actionbar_object);
		actionBarSwitches.forEach(function(element){
			var actionBarChanger = element.querySelector('.change-actionbar');
			if (actionBarChanger)
				actionBarChanger.addEventListener('click',toggleActionBar);
		});
		// topicViewElements
		


	})

})