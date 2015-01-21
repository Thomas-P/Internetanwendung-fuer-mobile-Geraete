/**
* @author Jörn Kreutel
* @refactored by thomas-p
*/
define('editView',function(debug,helper,longPress,eventHandler) {

	debug = debug.createConsole('controller/editView');
	debug.log('module loaded');

	var editView = null;
	var tabsContainer = null;
	var inactiveTabsContainer = null;
	var newElementTab = null;

	
	/**
	*
	*/
	function selectTab(elementType) {
		window.location.hash = 'tab_' + elementType;
		// we dispatch a ui event that allows the controllers inside the tab to react on tab selection (e.g. by setting focus)
		eventHandler.notifyListeners(eventHandler.customEvent('ui', 'tabSelected', elementType));
	}

	/**
	*
	*/
	function showTab(elementType) {
		if (Array.prototype.indexOf.call(tabsContainer.childNodes, newElementTab) == -1)
			helper.moveDomElements(newElementTab,tabsContainer);
		helper.moveDomElements('#tab_' + elementType, tabsContainer, newElementTab);
	}

	/**
	*
	*/
	function hideTab(elementType) {
		helper.moveDomElements('#tab_' + elementType, inactiveTabsContainer);
	}

	/*
	 * methods for handling opening and closing the editview
	 */
	function openEditView() {
		if (!editView)
			return debug.error('editView not set');
		editView.classList.toggle('overlay');
		// we will set the fragement identifier to the title tab to trigger the :target selector for foreground style assignment
		selectTab('title');
	}

	function closeEditView() {
		selectTab("");
		editview.classList.toggle("overlay");
	}

	function keepEditView(event) {
		event.stopPropagation();
	}


	/** FRM2 (8) **/
	function fillObjektData(data) {
		// TODO
		var root = document.querySelector('form[name=form_objekt]');
		if (!root) {
			console.error('editView.fillObjektData:: Could not find root');
			return;
		}
		var titleElement = root.querySelector('input[name=src]');
		if (titleElement)
			titleElement.value = data.title || '';
		var description = root.querySelector('textarea[name=description');
		if (description)
			description.innerText = data.description || '';
	}


	function initialize() {
		editView = document.querySelector('#editview');
		tabsContainer = document.querySelector('.tabsContainer');
		inactiveTabsContainer = document.querySelector('#inactiveTabsContainer'); 
		newElementTab = document.getElementById('tab_newElement');
		longPress.enableLongPress(document.getElementById('mainview'), openEditView);

		if (editView)
			editView.addEventListener('click',closeEditView);
		if (tabsContainer)
			tabsContainer.addEventListener('click',keepEditView);

		eventHandler.addEventListener(
			eventHandler.customEvent('crud','read|create','topicview'),
			function(){
				helper.moveDomElements(newElementTab, tabsContainer);
		});

		eventHandler.addEventListener(
			eventHandler.customEvent('crud','deleted','topicview'),
			function(){
				helper.moveDomElements(newElementTab, inactiveTabsContainer);
				if ( false == (editView && editView.classList.contains('overlay')) )
					return;
				editView.classList.toggle('overlay');
		});

		/** FRM2 (7) Anzeigen des Objekttabs für Editview **/
		eventHandler.addEventListener(
			eventHandler.customEvent('crud', 'read|create', 'object'), 
			function(event) {
				console.log('Editview: FRM2 (7) Tab Anzeigen', event);
				var data = event && event.data && event.data[0] || null;
				fillObjektData(data);
				showTab('objekt');
				showTab('objektList');
		});

		/** FRM2 (7) Anzeigen des Objekttabs für Editview **/
		eventHandler.addEventListener(eventHandler.customEvent('crud', 'delete', 'object'), function(event) {
			console.log('Editview: FRM2 (7) Tab ausblenden', event);
			var data = event && event.data && event.data[0] || null;
			fillObjektData(data);
			hideTab('objekt');
			// TODO: Check showTab('objektList');
		});

	}

	// initialize when DOM Ready
	helper.domReady(initialize);
});