/**
*	@author Ganna Demydova, Thomas Puttkamer
*/
/**
*	create the inner view by data
*/
var viewController = function() {





	/**
	*	JSR2 - 4.
	*/
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
	*	JSR2 - 3
	*/
	var createTextauszug = function(object) {
		var element = getElements(object.type);
		if (!element) {
			console.error('Could\'nt find textauszug element.');
			return;
		}
		/**
		*	generate a text view by the given content
		*/
		var createTextauzugText = function(text) {
			var szeneElement = element.querySelector('.szene');
			if (!szeneElement)
				return Error('Could not found element for scene');
			// bad idea -> message to tutor written
			szeneElement.innerHTML = text;
			// place to container
			placeElement(element,object.render_container);
		};

		xhr(object.src || null)
		.then(createTextauzugText)
		.catch(function(error) {
			console.error('Error while creating Textauszug: ',error);
		});
	};
	// end createTextauszug





	/**
	*	JSR2 - 4 Zeitdokumente
	*/
	var createZeitdokumente = function(object) {
		object.type = 'zeitdokumente';
		var element = getElements(object.type);
		if (!element) {
			console.error('Could\'nt find "Zeitdokumente" element.');
			return;
		}

		var image = element.querySelector('img');
		image.dataset.backupUrl = object.src_bak || void 0;
		image.alt = object.title || 'an image';
		image.src = object.src;
		image.dataset.description = object.description || 'Keine Beschreibung angegeben.';

		var figcaption = element.querySelector('figcaption');
		if (!figcaption)
			return;
		figcaption.textContent = object.title || '';
		// place to container
		placeElement(element,object.render_container);
	};
	// end createZeitdokumente





	/**
	*	create medienverweis or verknuepfung
	*/
	var createMedienVerweise = function(object) {
		var element = getElements(object.type);
		if (!element) {
			console.error('Could not create a element of ',object.type,'.');
			return;
		}
		element.id = object._contentitemid || Math.round(Math.random()*(1<<23));

		var title  = element.querySelector('section > header h2');
		if (title)
			title.textContent = object.subtype || object.title || 'No Title';

		var list = element.querySelector('ul');
		if (!list)
			return;

		if (!object || !object.content || !Array.isArray(object.content)) 
			return;

		object.content.forEach(function(el) {

			var listElement = document.createElement('li');

			var a = document.createElement('a');
			a.href = el.target || el.src || '#';
			a.textContent = el.title;
			if (el.mediatype) {
				a.type = el.mediatype;
			}

			// append
			listElement.appendChild(a);
			list.appendChild(listElement);
		});
		// placing to the render container
		placeElement(element,object.render_container);
	};
	// end createMedienVerweise





	/**
	*	create all the items in the given list
	*/
	var createContentItems = function(items) {
		if (!items)
			return;
		items.forEach(function(element) {
			if (!element.type)
				return;
			switch (element.type) {
				case 'zeitdokumente':
				case 'objekt':
				createZeitdokumente(element);
				break;
				// create a textauszug
				case 'textauszug':
				createTextauszug(element);
				break;
				// create object
				case 'object': 

				break;
				// create medienweise
				case 'medienverweise':
				createMedienVerweise(element);
				break;
			}
		});
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





	/**
	*
	*/
	var getElements = function(elementName) {
		var tmp = View.templates;
		if (!tmp[elementName]) {
			console.error('Could\'nt find an element with ',elementName,' in template list');
			return null;
		}
		// return an element from templates node
		if (elementName == 'medienverweise' || elementName == 'verknuepfungen') {
			return tmp[elementName].cloneNode(true);
		} else {
			return tmp[elementName];
		}
	};






	/**
	*	create a new wrapper element for medienweise objects
	*/
	var createWrapper = function() {
		var wrapperElement = document.createElement('div');
		wrapperElement.classList.add('wrapper');
		return wrapperElement;
	};






	/**
	*	places an element to the right container
	*/
	var placeElement = function(element,renderContainer) {
		var tmpRC = View.renderContainer || {};
		
		if (!element)
			return;
		if (!tmpRC[renderContainer]) {
			console.error('Render container not found: ',renderContainer);
			return;
		}

		tmpRC = tmpRC[renderContainer];

		if (element.classList.contains('medienweise')) {
			var actualWrapper = tmpRC.actualWrapper;
			if (!actualWrapper || actualWrapper.children.length>1) {
				// generate a new wrapper
				actualWrapper = createWrapper();
				tmpRC.actualWrapper = actualWrapper;
				tmpRC.domElement.appendChild(actualWrapper);
			}
			if (actualWrapper)
				actualWrapper.appendChild(element);
			return;
		}

		tmpRC.domElement.appendChild(element);

	};







	var isFirst = true;
	// view is the mainframe for our view
	var View = {};

	var firstStart = function() {

		if (!isFirst)
			return;
		isFirst = false;

		var tmpC = View.container = document.querySelector('.main-view');

		View.templates = {
			textauszug : document.querySelector('#textauszug') || document.createElement('div'),
			medienverweise: document.querySelector('.medienweise') || document.createElement('div'),
			zeitdokumente: document.querySelector('#objekt') || document.createElement('div'),
			footer: document.querySelector('footer.wrapper') || document.createElement('div')
		};

		// remove list entries from medienverweise
		var tmpM = View.templates.medienverweise.querySelector('ul');
		if (tmpM) {
			while (tmpM.children.length)
				tmpM.removeChild(tmpM.children[0]);
		}

		// create Render Container
		var tmpRC = View.renderContainer = {};

		// get name for render container
		if (tmpC && tmpC.dataset.container) {
			var tmpSplit = View.renderOrder = tmpC.dataset.container.split(',');

			// create for each named container one dom element and a wrapper node
			tmpSplit.forEach(function(cName) {
				var tmpDomElement = document.createElement('div');
				tmpDomElement.id = cName;
				tmpDomElement.classList.add('render-container');
				// add a new container with value of cName 
				tmpRC[cName] = {
					domElement: tmpDomElement,
					actualWrapper: null
				};
			});
		}
	};






	/**
	*	clear renderview
	*/
	var clear = function() {
		// get template fragments on first start
		firstStart();
		if (View.container) {
			// clearing view container
			while (View.container.children.length)
				View.container.removeChild(View.container.children[0]);
		}
		// clear wrapper
		var tmpRC = View.renderContainer || {};
		for (var key in tmpRC) {
			if (tmpRC[key].actualWrapper)
				tmpRC[key].actualWrapper = null;
			// temp for dom elements of render container
			var tmpDE = tmpRC[key].domElement;
			while(tmpDE.children.length) {
				tmpDE.removeChild(tmpDE.children[0]);
			}
		}
		if (View.renderOrder) {
			// place render container in the right order
			View.renderOrder.forEach(function(cName) {
				View.container.appendChild(tmpRC[cName].domElement);
			});
		}
	};







	// Closure function 
	return function (viewLink) {
		// clear View;
		clear();
		
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