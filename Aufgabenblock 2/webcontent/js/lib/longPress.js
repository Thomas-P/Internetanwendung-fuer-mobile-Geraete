define('longPress',function(debug) {

	debug = debug.createConsole('lib/longPress');
	debug.log('module loaded');

	var toastIsShown = false;
	/**
	* shows a toast
	**/
	function showToast(text) {
		// remember that you show a toast
		if (toastIsShown)
			return;
		toastIsShown = true;
		// access the toast element
		var toast = document.querySelector(".toast");
		if (!toast)
			return;
		// set the current time on the toast, didn't use
		var currenttime = new Date();

		toast.textContent = text;
		toast.classList.toggle("active");
		setTimeout(function() {
			toastIsShown = false
			toast.classList.toggle("active");
		}, 3500);
	}

	/**
	* Do a longPress 
	**/
	var longPressCallbackFunction = null;	//
	var longpressTimeOut = 1000;			// call delay
	var longpressTimer = null; 				// function timer

	var startLongPressMode = function(event) {
		event.stopPropagation();
		longpressTimer = window.setTimeout(function() {
			if (longPressCallbackFunction)
				longPressCallbackFunction(event);
			longpressTimer = null;
		}, longpressTimeOut);
	}

	var chancelLongPressMode = function(event) {
		if (longpressTimer)
			window.clearTimeout(longpressTimer);
		longpressTimer = null;
	}

	/* enable longpress on an element */
	function enableLongPress(element, callback) {

		if (!callback || !element) {
			console.error ('Could not set element or callback',element,callback);
			return;
		}
		// set the callback
		longPressCallbackFunction = callback;

		// set the function as arguments
		element.addEventListener("mousedown", startLongPressMode);
		element.addEventListener("touchstart", startLongPressMode);

		element.addEventListener("mouseup", chancelLongPressMode);
		element.addEventListener('touchend', chancelLongPressMode);
		//element.addEventListener("mousemove", chancelLongPressMode);

		//element.addEventListener("mousemove", chancelLongPressMode);
		element.addEventListener("touchmove", chancelLongPressMode);

	}

	return {
		enableLongPress : enableLongPress,
		showToast: showToast
	}


});