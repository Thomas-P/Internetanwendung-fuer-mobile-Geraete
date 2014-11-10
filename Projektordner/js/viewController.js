/**
*	@author Ganna Demydova, Thomas Puttkamer
*/
/**
*	create the inner view by data
*/
var viewController = function() {

	var wrapperElement = document.createElement('div');
	wrapperElement.classList.add('wrapper');

	var medienweiseElement;

	var actualWrapper;
	/**
	*	get a new element of medienweise
	*/
	var createMedienweiseElement = function(secondTime) {
		if (medienweiseElement)
			return medienweiseElement.cloneNode(true);
		if (secondTime === true) {
			console.log('could not wrap medienweise');
			return null;
		}
		medienweiseElement = document.querySelector('.medienweise');
		if (medienweiseElement) {
			var list = medienweiseElement.querySelector('ul');
			while (list.children.length)
				list.removeChild(list.children[0]);
		}
		return createMedienweiseElement(true);
	};
	// end function medienweise



	var kringelKlick = function(event) {
		//do a kringelKlick
		if (!event || !event.target || event.target.id!='objektKringel')
			return;
		var element = event.target;
		while (element!==null && element.tagName != 'SECTION') {
			element = element.parentElement;
		}
		if (!element)
			return;
		// via data attribute
		alert(element.querySelector('img').dataset.description);
	};
	window.addEventListener('click',kringelKlick);



	/**
	*	generate a text view by the given content
	*/
	var createTextauzug = function(text) {
		var TextauszugElement = document.getElementById('textauszug');
		if (!TextauszugElement)
			return Error('Textauszug element not found');
		var szeneElement = document.querySelector('#textauszug .szene');
		if (!szeneElement)
			return Error('Could not found element for scene');
		// bad idea -> message to tutor written
		szeneElement.innerHTML = text;
		TextauszugElement.style.display = 'inline-block';
	};
	// end createTextauszug
	/**
	*	Zeitdokumente
	*/
	var createObject = function(objectData) {

		var objectElement = document.querySelector('#objekt');
		if (!objectElement)
			return Error('Objekt element not found');

		var image = objectElement.querySelector('img');
		image.dataset.backupUrl = objectData.src_bak || void 0;
		image.alt = objectData.title || 'an image';
		image.src = objectData.src;
		image.dataset.description = objectData.description || 'Keine Beschreibung angegeben.';

		var figcaption = objectElement.querySelector('figcaption');
		if (!figcaption)
			return;
		figcaption.textContent = objectData.title || '';
		objectElement.style.display = 'inline-block';
	};
	// end createObject
	/**
	*	
	*/
	var createMedienweise = function(medienObject) {
		var element = createMedienweiseElement();
		if (!element) {
			console.log('Could not create a element of medienweise.');
			return;
		}
		element.id = medienObject._contentitemid || Math.round(Math.random()*(1<<23));

		var title  = element.querySelector('section > header h2');
		if (title)
			title.textContent = medienObject.subtype;

		var list = element.querySelector('ul');
		if (!list)
			return;

		if (!medienObject || !medienObject.content || !Array.isArray(medienObject.content)) 
			return;

		medienObject.content.forEach(function(el) {

			var listElement = document.createElement('li');

			var a = document.createElement('a');
			a.href = el.target || '#';
			a.textContent = el.title;

			// append
			listElement.appendChild(a);
			list.appendChild(listElement);
		});

		if (!actualWrapper || actualWrapper.children.length>1) {
			actualWrapper = wrapperElement.cloneNode(true);
			var area = document.querySelector('#mainScrollArea');
			if (area)
				area.appendChild(actualWrapper);
		}
		if (actualWrapper)
			actualWrapper.appendChild(element);
	};
	/**
	*	create the view by the given view data;
	*/
	var createView = function(viewData) {
		if (typeof viewData !== 'object')
			return Error('no view data given');
		var title = viewData.title || 'No title';
		document.querySelector('main > article > header > h1').textContent = title;

		if (!viewData.content_items || !Array.isArray(viewData.content_items))
			return null;
		else
			return viewData.content_items;
	};

	var createContentItems = function(items) {
		if (!items)
			return;
		items.forEach(function(element) {
			if (!element.type)
				return;
			switch (element.type) {
				case 'zeitdokumente':
				createObject(element);
				break;
				// create a textauszug
				case 'textauszug':
				xhr(element.src || null)
				.then(createTextauzug)
				.catch(function(error) {
					console.error('Error while creating Textauszug: ',error);
				});
				break;
				// create object
				case 'object': 

				break;
				// create medienweise
				case 'medienverweise':
				createMedienweise(element);
				break;
			}
		});
	};

	// Closure function 
	return function (viewLink) {
		// create view by given config via viewLink
		var contentElement = document.querySelector('#mainScrollArea');
		if (contentElement) {
			doUnvisible = ['#objekt', '#einfuehrungstext', '#textauszug'];
			var element;
			doUnvisible.forEach(function(id) {
				element = contentElement.querySelector(id);
				if (!element)
					return;
				element.style.display = 'none';
			});
			if (!medienweiseElement)
				createMedienweiseElement();
			while (element = contentElement.querySelector('div.wrapper')) {
				contentElement.removeChild(element);
			};
		}
		xhr(viewLink)
		.then(createView)
		.then(createContentItems)
		.catch(function(error) {
			// catching errors while view set
			console.error(error);
			alert('An error occurd while fetching content data');
		});
	};
}();