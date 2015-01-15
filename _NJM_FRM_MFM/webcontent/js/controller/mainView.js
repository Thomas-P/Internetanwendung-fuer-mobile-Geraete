define('mainView',function(debug,navigation) {

	debug = debug.createConsole('mainViewController');
	debug.log('module loaded');
	// Define Elements
	var naviBackButton;
	// all elements, which switch 
	var actionBarSwitches = [];

	/**
	* Event Listener for the Back Button
	*
	*/
	var navigationGoBackEvent = function(event) {
		event.preventDefault();
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
			element.addEventListener('click',toggleActionBar);
		});
		// topicViewElements
		


	})

})