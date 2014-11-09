/**
 * @author Ganna Demydova, Thomas Puttkamer
 */
/**
 * the detailSwitch switches the view between normal an detail view.
 *
 * @properties 
 *	.detail-back 	class for the back button
 *	.detail-switch 	class to switch to detail view
 *	.detail-view	class for an element which could be viewed in detail
 *		-> must be an parent element of the element with .detail-switch
 *	.detail-active	class for an element which is actual in the detail view
 *	main.fade-out 	class for fading function
 *	body.detail 	class if switched to detail
 */

 var detailSwitch = function() {
 	/** Implementing the detail function **/
 	/** gobal vars **/
 	var detailed = false;		// switch to detail or not
 	var isFading = false;		// remember if fading is active
 	var detailElement = null;	// remember the detail element.
 	// main elements for the detail view 
	var mainElement = document.querySelector('main');	// get the main Element, must be set
	if (!mainElement) {
		console.error('Could not start detailSwitch because the element main could\'nt be found.');
		return;
	}
	var bodyElement = document.querySelector('body');	// get the body element, must be set
	if (!bodyElement) {
		console.error('Could not start detailSwitch because the element body could\'nt be found.');
		return;
	}
	// functionality implemented here
 	/**
 	*	traverse the parent element of an given element until body 
 	*	or an element with the class .detail-view
 	*	@param an document->element
 	*	@return element or null
 	*/
 	var traverseForDetailView = function(traverseElement) {
 		while (!traverseElement.classList.contains('detail-view')) 
 		{
 			if (traverseElement.tagName == 'BODY')
 				return null;
 			if (traverseElement.parentNode==null)
 				return null;
 			traverseElement = traverseElement.parentNode;
 			console.log(traverseElement);
 		}
 		return traverseElement;
 	};
 	/**
 	*	listen on click for .detail-back and .detail-switch
 	*	set fade-out to the main element.
 	*/
 	var listenToDetailElements = function(event) {
 		var element = event.target;
 		// check for class
 		var isBack = element.classList.contains('detail-back');
 		var isSwitch = element.classList.contains('detail-switch');
 		// prevent default for switch and back buttons
 		if (isBack || isSwitch)
 			event.preventDefault();
		// if fading is active return
		if (isFading)
			return;
 		// get the clicked element by event.target
 		if (detailed) {
 			// no back button clicked then return
 			if (!isBack)
 				return;
 		} else {
 			// button with .detail-switch could be clicked
 			if (!isSwitch)
 				return;
 			// find the element for the detail view
 			detailElement = traverseForDetailView(element);
 			// return if the element not found
 			if (!detailElement) {
 				console.error('Could not find an element with the class .detail-view.');
 				return;
 			}
 		}
 		ifFading = true;
 		mainElement.classList.add('fade-out');
 	};
 	/**
 	*	implementation of a transition listener for the main event
 	*	it alsow check if the switch is an switch from normal to detail
 	*	and vice versa
 	**/
 	var transistionListener = function(event) {
 		// did not contail .fade-out
 		if (!mainElement.classList.contains('fade-out')) {
 			// fade from fade-out to normal
 			isFading = false;
 			return;
 		}
 		// otherwise fade is form normal to fade-out
 		// here we implements the switch form normal to 
 		// detail view.
 		if (bodyElement.classList.contains('detail')) {
 			// remove detail class
 			bodyElement.classList.remove('detail');
 			detailElement.classList.remove('detail-active');
 			// set detailElement to null
 			detailElement = null;
 			detailed = false;
 		} else {
 			bodyElement.classList.add('detail');
 			detailElement.classList.add('detail-active');
 			detailed = true;
 		}
 		// remove fade-out so we fade from fade-out to normal
 		// the event listener calls a second time, when this is done
 		mainElement.classList.remove('fade-out');
 	}; 
 	// Adding event listener
 	window.addEventListener('click',listenToDetailElements);
 	mainElement.addEventListener('transitionend',transistionListener);
};

window.addEventListener('load',detailSwitch);