/**
* @author Jörn Kreutel
* @refactored by thomas-p
*/
define('editView',function(debug,helper,longPress,eventHandler,crud,objectView) {

	debug = debug.createConsole('controller/editView');
	debug.log('module loaded');

	var editView = null;
	var tabsContainer = null;
	var inactiveTabsContainer = null;
	var newElementTab = null;
	// save object Data
	var _objectData = null;
	var _assignedObject = null
	var _topicView = null;

	// defines the mode ob upload
	var _objectUploadMode;
	var _iframe;


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
	function fillObjektData(data,assigned) {
		if (assigned)
			_assignedObject = data
		else
			_objectData = data
		data = data || {}
		// TODO
		console.log('FRM2 (8): fillObjektData,',data)
		var root = document.querySelector('form[name=form_objekt]');
		if (!root) {
			console.error('editView.fillObjektData:: Could not find root');
			return;
		}
		var titleElement = root.querySelector('input[name=title]');
		if (titleElement)
			titleElement.value = data.title || '';
		// wohlgeformte URLs
		var srcElement = root.querySelector('input[name=src]')
		var url = data.src || null
		var a
		if (url) {
			a = document.createElement('a')
			a.href = url
		}
		if (srcElement && srcElement.type=='url') {
			srcElement.value = url ? a.href : ''
		}

		var imgPreview = document.getElementById('pictureprev_object');
		if (imgPreview)
			imgPreview.src = data.src || '';
		var description = root.querySelector('textarea[name=description]');
		if (description)
			description.value = data.description || '';
		var idElement = document.getElementById('objekt_id_for_form_upload');
		if (idElement)
			idElement.textContent = (data._id || assigned ? 'Wird zugewiesen.' : 'Wird automatisch vergeben.' )
		idElement = root.querySelector('input[name=_id]');
		if (idElement)
			idElement.value = data.id || ''

		var changeButton = document.getElementById('addOrUpdateObjectButton')

		if (assigned)
			changeButton.value = 'Zuweisen'
		else 
			changeButton.value = data._id ? 'Ändern' : 'Erzeugen'

	}


	function initialize() {
		editView = document.querySelector('#editview');
		tabsContainer = document.querySelector('.tabsContainer');
		inactiveTabsContainer = document.querySelector('.inactiveTabsContainer'); 
		newElementTab = document.getElementById('tab_newElement');
		longPress.enableLongPress(document.getElementById('mainview'), openEditView);
		var imgPreview = document.getElementById('pictureprev_object');
		if (imgPreview) {
			imgPreview.addEventListener('error',function() {
				imgPreview.style.setProperty('display','none');
			})
			imgPreview.addEventListener('load',function() {
				imgPreview.style.setProperty('display','block');
			})
		}

		if (editView)
			editView.addEventListener('click',closeEditView);
		if (tabsContainer)
			tabsContainer.addEventListener('click',keepEditView);

		var newE = document.getElementById('create_a_new_object');
		if (newE)
			newE.addEventListener('click',function(event) {
				if (confirm('Create a new object?'))
					_objectData = null
				fillObjektData()
			})

	}



	/**
	* implement MFM
	*/
	/**
	* FRM2 (2)
	*/
	function postEvent(event) {
		if (!_objectUploadMode) {
			event.stopPropagation();
			event.preventDefault();
			return(alert('No Method used'))
		}
		if (_objectUploadMode == 2) {
			return;
		}
		console.log('FRM2 (2) Modifizieren und Erzeugen via submit');
		event.stopPropagation();
		event.preventDefault();
		if (_objectUploadMode == 3) {
			if (!_assignedObject || !_assignedObject._id)
				return alert('assigned no object')
			crud.removeContentItem(_topicView.title,'objekt', function(err,result) {
				crud.addContentItem(_topicView.title,{
					type: 'objekt',
					renderContainer: 'column_left',
					objectId: _assignedObject._id
				},function(err) {
					if (err) {
						return
							alert('Could not assign object')
					}
					selectTab('objekt')
					setInputType(1)
				});
			})
			return
		}
		
		var form = document.forms.form_objekt || null;
		var title, src, description;
		if (form.title && form.title.value) {
			title = form.title.value;
		} else {
			title = ''
		}
		if (form.src && form.src.value) {
			src = form.src.value;
		}
		if (form.description && form.description.value) {
			description = form.description.value;
		}
		var object = {
			'title' : title || '',
			'src'	: src || '',
			'description'	: description || ''
		}
		if (_objectData && _objectData._id) {
			object._id = _objectData._id;
			crud.updateObject(_objectData._id,object,function(err,data) {
				_objectData = data[0] || null;
			});
		} else {
			objectView.createObject(object);
		}
	}

	function initializeMFM() {
		addRadioEvents();
		var objektForm = document.querySelector('form[name=form_objekt]');
		if (objektForm)
			objektForm.addEventListener('submit',postEvent);

	}

	function setInputType() {
		if (arguments.length > 0) {
			_objectUploadMode = ~~arguments[0] || _objectUploadMode
		}

		var form = document.querySelector('form[name=form_objekt]')
		var srcElement = form.querySelector('input[name=src]')
		var descElement = form.querySelector('textarea[name=description]')
		var titleElement = form.querySelector('input[name=title]')
		var deleteButton = document.getElementById('deleteObjectButton')
		var changeButton = document.getElementById('addOrUpdateObjectButton')
		var newE = document.getElementById('create_a_new_object');


		// set fileupload
		if ( 2 == _objectUploadMode ) {
			srcElement.type = 'file'
		} else {
			srcElement.type = 'url'
		}


		if ( 3 == _objectUploadMode ) {
			srcElement.disabled = descElement.disabled = titleElement.disabled = true
			deleteButton.style.display = 'none'
			changeButton.value = 'Zuweisen'
			fillObjektData(_assignedObject,true)
			newE.style.display = 'none'

		} else {
			srcElement.disabled = descElement.disabled = titleElement.disabled = false
			deleteButton.style.display = _objectData ? 'block' : 'none'
			changeButton.value = _objectData ? 'Ändern' : 'Erzeugen'
			fillObjektData(_objectData)
			newE.style.display = 'block'
		}

		eventHandler.notifyListeners(eventHandler.customEvent('editView','setInputType','',_objectUploadMode));
	}

	/**
	*	set Zuweisung
	*/
	eventHandler.addEventListener(eventHandler.customEvent('allObject','getObject',''),function(event) {
		_assignedObject = event.data || null
		fillObjektData(_assignedObject,true)
		selectTab('objekt')
	});

	function radioButtonEvent(event) {
		var oldMode = _objectUploadMode
		var input = document.querySelector('input[name=src]')
		var form = document.querySelector('form[name=form_objekt]')
		if ( 'object_upload_via_url' == this.id ) {
			_objectUploadMode = 1

		} else if ( 'object_upload_via_upload' == this.id ) {
			_objectUploadMode = 2

			if (!_iframe) {
				_iframe = document.createElement('iframe')
				_iframe.addEventListener("load", function () {
    				var iframeDocument = this.contentDocument || this.contentWindow.document;
    				var bodyText = (iframeDocument && iframeDocument.body) ? iframeDocument.body.textContent : null;
    				if (!bodyText || '' == bodyText)
    					return
    				var bodyJson = JSON.parse(bodyText)
    				if (Array.isArray(bodyJson)) {
    					// got the data
						// submited data
    					console.log(bodyJson)
    					bodyJson = bodyJson[0] || {}
						if (bodyJson.submit)
							delete bodyJson.submit
						if (_objectData)
							bodyJson._id = _objectData._id					
    					if (bodyJson._id) {
    						crud.updateObject(bodyJson._id,bodyJson,function(err) {
    							if (err)
    								alert('Could not update')
    						})
    					} else {
    						crud.createObject(bodyJson,function(err) {
    							if (err)
    								alert('Could not create object')
    						})
    					}
    				} else {
    					// fail
    					alert (bodyText)
    				}



				});
				_iframe.name = 'funny_name_for_iframe'
				if (form) {
					form.target = _iframe.name
					_iframe.style.display = 'none';
					form.appendChild(_iframe)
				}
			}

		} else if ( 'object_choose_by_list' == this.id ) {
			_objectUploadMode = 3
			_assignedObject = null
			selectTab('objektList')
		
		}
		// store older version
		if (oldMode == 1 || oldMode == 2) {
			_objectData = _objectData || {}
			var form = document.querySelector('form[name=form_objekt]')
			var srcElement = form.querySelector('input[name=src]')
			var descElement = form.querySelector('textarea[name=description]')
			var titleElement = form.querySelector('input[name=title]')
			_objectData.description = descElement.value
			if (oldMode==1)
				_objectData.src = srcElement.value
			_objectData.title = titleElement.value
		}
		setInputType();
	}


	function addRadioEvents() {
		var radios = document.querySelectorAll('#tab_objekt .radiogroup input[type=radio]')
		for (var i = 0; i< radios.length; i++) {
			radios[i].addEventListener('change',radioButtonEvent)
		}
	}



	eventHandler.addEventListener(
		eventHandler.customEvent('crud','read|create','topicView'),
		function(event){
			if (!(event && event.data && event.data[0]))
				return;
			_topicView = event.data[0];
			helper.moveDomElements(newElementTab, tabsContainer);
			showTab('objekt');
			showTab('objektList');
	});

	eventHandler.addEventListener(
		eventHandler.customEvent('crud','delete','topicView'),
		function(){
			helper.moveDomElements(newElementTab, inactiveTabsContainer);
			if ( false == (editView && editView.classList.contains('overlay')) )
				return;
			editView.classList.toggle('overlay');
			hideTab('objekt');				
	});

	/** FRM2 (7) Anzeigen des Objekttabs für Editview **/
	eventHandler.addEventListener(
		eventHandler.customEvent('crud', 'read|create|update', 'object'), 
		function(event) {
			console.log('Editview: FRM2 (7) Tab Anzeigen', event);
			var data = event && event.data && event.data[0] || null;
			if (data) {
				fillObjektData(data);
				showTab('objektList');
			}
			// FRM2 (3)
			var form = document.querySelector('form[name=form_objekt]');
			if (form) {
				var a = document.createElement('a');
				a.href = '/api/object/' + (_objectData && _objectData._id ? _objectData._id : '')
				form.action = a.href;
			}

	}); // end event Listener

	/** FRM2 (7) Anzeigen des Objekttabs für Editview **/
	eventHandler.addEventListener(eventHandler.customEvent('crud', 'delete', 'object'), function(event) {
		console.log('Editview: FRM2 (7) Tab ausblenden', event);
		var data = event && event.data && event.data[0] || null;
		fillObjektData();
		// TODO: Check showTab('objektList');
		// FRM2 (3)
		var deleteButton = document.querySelector('#deleteObjectButton');
		if (deleteButton) {
			deleteButton.style.setProperty('display','none');
		}
		var addOrUpdateObjectButton = document.querySelector('#addOrUpdateObjectButton');
		if (addOrUpdateObjectButton) {
			addOrUpdateObjectButton.value = 'Erzeugen';
		}
	});


	// initialize when DOM Ready
	helper.domReady(initialize);
	helper.domReady(initializeMFM);

	return {
		showTab : showTab,
		hideTab : hideTab
	}

});

