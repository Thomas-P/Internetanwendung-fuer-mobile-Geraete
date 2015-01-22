define('allObjectController',function(debug,helper,eventHandler,crud) {

	debug = debug.createConsole('controller/allObject');
	debug.log('module loaded');

	var objectList = [];
	var listNode = null;
	var listStart = null;


	/**
	*	w
	*/
	function addObjectToList(data) {

	}
	/**
	*	d
	*/


	function prepareList() {
		listNode = document.querySelector('.objectList');
		if (listNode && listNode.parent) {
			listStart = listNode.parent;
			listNode.parent.removeChild(listNode);
		}
	}

	function initialize() {
		// read all objects
		crud.readAllObject(function(err,objectList) {
			if (err || !objectList) 
				return;

		}) 
	}

	// initialize when DOM Ready
	helper.domReady(initialize);


})