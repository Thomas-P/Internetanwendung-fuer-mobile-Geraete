define('allObjectController',function(debug,helper,eventHandler,crud) {

	debug = debug.createConsole('controller/allObject');
	debug.log('module loaded');

	var objectList = [];
	var listNode = null;
	var listStart = null;

	/**
	*	create an object id for all <tr>s
	*/
	function createObjectId(id) {
		return 'object_' + id;
	}

	/**
	*	changes the values of a node, with the given data
	*	@param node <tr> node
	*	@param data object data
	*/
	function changeNode(node, data) {
		if ( false == (node && data) )
			return;
		if (!data._id)
			return console.error('object has no id.',data);
		node.id = createObjectId(data._id);
		var tmpElement;
		// object id
		tmpElement = node.querySelector('.object-id');
		if (tmpElement)
			tmpElement.textContent = '#' + data._id;
		// object title
		tmpElement = node.querySelector('.object-title');
		if (tmpElement) {
			tmpElement.textContent = data.title || '';
			tmpElement.style.setProperty('display', data.title ? 'block' : 'none');
		}
		// object description
		tmpElement = node.querySelector('.object-description');
		if (tmpElement) {
			tmpElement.textContent = data.description || '';
			tmpElement.style.setProperty('display', data.description ? 'block' : 'none');
		}
		// object description
		tmpElement = node.querySelector('.object-img-thumbnail');
		if (tmpElement) {
			tmpElement.src = data.src || '';
			tmpElement.style.setProperty('display', data.description ? 'block' : 'none');
		}
	}
	/**
	*	set an item to the object list
	*	@param data object data
	*/
	function setItem(data) {
		if (!data._id || !listNode) {
			return 
				console.error('no _id for the given object.',data);
		}
		var findNode = document.getElementById(createObjectId(data._id));
		if (!findNode) {
			// create a new node for object
			findNode = listNode.cloneNode(true);
			// img will only shown if an image exists
			var img = findNode.querySelector('img');
			if (img) {
				img.addEventListener('error',function(event) {
					this.style.setProperty('display','none');
				})
				img.addEventListener('load',function(event) {
					this.style.setProperty('display','block');
				})
				img.style.setProperty('display','none');
			} // end add event listener to img. no image not visible
			changeNode(findNode, data);
			if (listStart.children[0]) {
				listStart.insertBefore(findNode, listStart.children[0]);
			} else {
				listStart.appendChild(findNode);
			}

		} else {
			// change node
			changeNode(findNode, data);
		}
	} // end setItem()

	/**
	*	removes an item from object list
	*/
	function removeItem(id) {
		var findNode = document.getElementById(createObjectId(id));
		if (findNode && findNode.parentElement)
			findNode.parentElement.removeChild(findNode);
		console.log(findNode,'removed');
	}

	/**
	*	prepares list for insert
	*/
	function prepareList() {
		listNode = document.querySelector('.object-list tr');
		if (listNode && listNode.parentElement) {
			listStart = listNode.parentElement;
			listNode.parentElement.removeChild(listNode);
		} else {
			console.error('No listitem found, could not load objects list.');
			return;
		}
	}

	function handleDeleteObject(event) {
		var data = event.data || [];
		console.log('tried to remove',data);
		if (data && data[0] && data[0]._id) {
			removeItem(data[0]._id);
		}
	}

	function handleSetObject(event) {
		var data = event.data || [];
		if (!Array.isArray(data)) {
			console.error('no data for object; must be an array',data);
		}
		data.forEach(function(element) {
			setItem(element);
		})
	}

	eventHandler.addEventListener(eventHandler.customEvent("crud", "create|read|update", "object"),handleSetObject);
	eventHandler.addEventListener(eventHandler.customEvent("crud", "delete", "object"),handleDeleteObject);

	function initialize() {
		// get the template Element for the list
		prepareList();
		// read all objects
		crud.readAllObject(function(err,objectList) {
			if (err || !objectList || !Array.isArray(objectList)) 
				return;
			objectList.forEach(function(element) {
				setItem(element);
			})
		}) 
	}

	// initialize when DOM Ready
	helper.domReady(initialize);


})