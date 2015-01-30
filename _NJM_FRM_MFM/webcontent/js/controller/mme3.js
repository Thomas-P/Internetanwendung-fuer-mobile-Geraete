define('mme3',function(debug, helper, eventHandler) {

	debug = debug.createConsole('controller/mme3');
	debug.log('module loaded');

	/** Implementing the detail function **/
 	/** gobal vars **/
 	var detailed = false;		// switch to detail or not
 	var isFading = false;		// remember if fading is active
 	// main elements for the detail view 
	var mainElement;
	var imageElement;
	var backElement
	var showVideo
	var videoElement

 
 	function doFade(event) {
 		event.preventDefault();
 		event.stopPropagation();
 		event.stopImmediatePropagation();
 		if (isFading)
 			return;
 		mainElement.classList.add('fade-out');
 		isFading = true;
 		if (!showVideo) {
			eventHandler.notifyListeners(eventHandler.customEvent('video','start'));
 		} else {
 			// video is shown, stop it
 			if (videoElement && videoElement.pause)
 				videoElement.pause();

 		}
		showVideo = true;
 	}
 	/**
 	*	implementation of a transition listener for the main event
 	*	it alsow check if the switch is an switch from normal to detail
 	*	and vice versa
 	**/
 	var transistionListener = function(event) {
 		// did it not contains .fade-out
 		if (false === mainElement.classList.contains('fade-out') ) {
 			// fade from fade-out to normal
 			isFading = false;
 			if (!mainElement.classList.contains('show-video')) {
	 			showVideo = false;
	 			// say that the video is removed
	 			eventHandler.notifyListeners(eventHandler.customEvent('video','stop'));
 			} else {
 				// start the video
	 			if (videoElement && videoElement.play)
	 				videoElement.play();

 			}
 			return;
 		}
 		if (mainElement.classList.contains('show-video')) {

 			imageElement.addEventListener('click',doFade);
 			backElement.removeEventListener('click',doFade)

 		} else {
 			backElement.addEventListener('click',doFade);
 			imageElement.removeEventListener('click',doFade)
 		}
		// toggle .show-video
		mainElement.classList.toggle('show-video');
 		// otherwise fade is form normal to fade-out
 		mainElement.classList.remove('fade-out');
 	}; 

 	function initialize() {
	 	// Adding event listener
	 	mainElement = document.getElementById('mainview');
	 	imageElement = document.querySelector('.detail-switch');
	 	backElement = document.querySelector('.detail-back');
	 	videoElement = document.getElementById('videoElement');
	 	if (! (mainElement && imageElement && backElement) ) {
	 		console.error('Could not find elements.');
	 		return;
	 	}

	 	imageElement.addEventListener('click',doFade);
	 	mainElement.addEventListener('transitionend',transistionListener);
	}
	// initialize when DOM Ready
	helper.domReady(initialize);

});