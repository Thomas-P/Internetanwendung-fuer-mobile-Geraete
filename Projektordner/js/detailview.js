/**
 * @author Ganna Demydova, Thomas Puttkamer
 */

window.onload = function() {

	var detailsansicht = document.getElementsByClassName('detailView');
	var detailArray = Array.prototype.slice.call(detailsansicht);
	var bodyElement = document.getElementsByTagName('body');
	if (bodyElement && bodyElement[0])
		bodyElement = bodyElement[0];
	if (!bodyElement) {
		console.error('Could not find Body');
		return;
	}


	var mainElement = document.getElementsByTagName('main');
	if (mainElement && mainElement[0])
		mainElement = mainElement[0];
	if (!mainElement) {
		console.error('Could not find main');
		return;
	}

	mainElement.addEventListener('transitionend',function(e) {
		if (mainElement.classList.contains('fade-out')) {

			if (bodyElement.classList.contains('detail')) {
				// Zurückbutton gedrückt
				bodyElement.classList.remove('detail');
				actualDetailView.classList.remove('detailView');
				actualDetailView = null;
			} else {
				// Detailbutton gedrückt
				bodyElement.classList.add('detail');
				actualDetailView.classList.add('detailView');
			}
			mainElement.classList.remove('fade-out');
			
		} else {
			isFading = false;
		}
	});

	var actualDetailView = null;
	var isFading = false;
	/**


	*/
	var detailClick = function(e) {
		e.preventDefault();
		if (actualDetailView!==null || isFading) {
			return;
		}
		var traverseElement = e.target;
		while (traverseElement.tagName != 'BODY' && traverseElement.tagName!='SECTION' && traverseElement!==null) {
			traverseElement = traverseElement.parentNode;
		}
		if (traverseElement==null) {
			console.error('Could not find an element for the detailView');
			return;
		}
		actualDetailView = traverseElement;
		isFading = true;

		// fadeIn

		mainElement.classList.add('fade-out');

	}

	var zurueckClick = function(e) {
		e.preventDefault();
		if (actualDetailView===null || isFading) {
			return;
		}
		mainElement.classList.add('fade-out');		
	}

	var zurueckButton = document.getElementById('zurueck');
	if (zurueckButton)
		zurueckButton.addEventListener('click',zurueckClick);



	detailArray.forEach(function(element) {
		element.addEventListener('click',detailClick);
	});

	return;

}