/**
 * @author Jörn Kreutel
 */

// extend the iam module
var iam = (function(iammodule) {

	console.log("loading TopicviewViewContoller as submodule controller.topicview of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	for (var mod in iammodule) {
		console.log("found submodule: iam." + mod);
	}

	function TopicviewViewController() {

		/**
		 * @author Jörn Kreutel
		 */
		// most important changes to the version from the NJM lesson:
		// - added topicview_element
		// - added optional arguments to the CRUD operations

		// we read out the topicid from the arguments that had been passed when opening this view
		var topicid;

		// we also read out the title element from the dom, which will be accessed from several methods
		var titleel;

		// the two actionbar parts
		var actionbar_title;
		var actionbar_object;

		// we add a topicview variable that holds a topicview element description from the server if one exists
		var topicviewObj;

		// this variable will keep the object that wraps the CRUD operations
		var crudops;


		//
		var objData;
		/*
		 * we use an event dispatcher
		 */
		 eventDispatcher = iam.eventhandling.newEventDispatcher();

		 /** NJM2 (6) Objekt anzeigen**/
		 function showObject() {
		 	var element = document.getElementById('objekt');
		 	if (!element) {
		 		console.error('Could\'nt find "Zeitdokumente" element.');
		 		return;
		 	}
		 	if (!objData)
		 		return element.style.visibility = 'hidden';

		 	var image = element.querySelector('img');
		 	image.dataset.backupUrl = objData.src_bak || void 0;
		 	image.alt = objData.title || 'an image';
		 	image.src = objData.src || '';
		 	image.dataset.description = objData.description || 'Keine Beschreibung angegeben.';
		 	element.style.visibility = 'visible';

		 	var figcaption = element.querySelector('figcaption');
		 	if (!figcaption)
		 		return;
		 	figcaption.textContent = objData.title || '';
		 }

		/*
		 * this is tun
		 */
		 this.initialiseView = function() {

		 	topicid = iam.navigation.getViewargs().topicid;
		 	console.log("topicid is: " + topicid);

			// instantiate the variables that bind the ui elements
			titleel = document.getElementById("topic_title");
			console.log("determined title element: " + titleel);
			actionbar_title = document.getElementById("actionbar_title");
			actionbar_object = document.getElementById("actionbar_object");

			// instantiate the component for the crud operations
			crudops = iam.crud.remote.newInstance();

			// instantiate the editview
			var editviewVC = iam.controller.editview.newInstance(topicid, eventDispatcher, crudops);
			editviewVC.initialiseView();

			/*
			 *  instantiate the event handlers that react to crud events: CRUD for topicview
			 */
			 eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "read|created|updated", "topicview"), function(event) {
				// read the Object if a topic is read
				if (event.type == "read") {
					topicviewObj = event.data;
					console.log('Reading objekt',topicviewObj);
					this.readObject();
				}


				// we update our local representation of the object
				if (event.type == "updated") {
					topicviewObj.title = event.data.title;
				} else {
					topicviewObj = event.data;
				}

				if (event.type == "deleted") {
					//document.location.href = '//' + document.location.host + '/' + document.location.pathname;
				}
				// and we trigger the visualisation of it
				updateTitleView.call(this);
			}.bind(this));


			 eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "deleted", "topicview"), function(event) {
				// we update our local representation of the object
				topicviewObj = null;
				// and we trigger the visualisation of it
				updateTitleView.call(this);
			}.bind(this));


			 /** NJM3 (2) content_items anfügen **/
			 eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "read|created", "object"), function(event) {
			 	if (event.type == "created") {
					// content Item pushen
					var contentItem = {
						type: 'objekt',
						render_container: 'column_left',
						objektid: event.data._id
					};

					topicviewObj.content_items.push(contentItem);

					console.log('Einfügen eines Objekts',topicviewObj);
					objData = event.data;

					this.addContentItem(contentItem);
				} 

				// show object for read and create
				showObject();

			}.bind(this));


			 /** NJM3 (4) Referenz aus content_items entfernen **/
			 eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "deleted", "object"), function(event) {

				objData = null;

				showObject();

				this.removeContentItem('objekt');

			}.bind(this));


			/*
			 * event handler that reacts to creation of an einfuehrungstext element
			 */
			 eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "uploaded|created", "einfuehrungstext"), function(event) {
			 	createEinfuehrungstext.call(this,event.data);
			 }.bind(this));

			// initialise the crud operations and try to read out a topicview object
			crudops.initialise( function() {

				crudops.readTopicview(topicid, function(_topicviewObj) {
					// check whether some topicview already exists
					if (_topicviewObj) {
						eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "read", "topicview", _topicviewObj));
					} else {
						this.createTopicview();
					}
				}.bind(this));
			}.bind(this));

		}
		
		/*
		 * this function updates the display of the title heading
		 */
		 function updateTitleView() {
		 	if (topicviewObj) {
				// we update the title element
				titleel.innerHTML = topicviewObj.title;
				// we deactivate the createTopicview() action
				document.getElementById("createTopicviewAction").href = "#";
			} else {
				titleel.innerHTML = "Lorem Ipsum";
			}
		}

		/*********************************************************************************
		 * NJM: these are the actions that will be invoked from the action bar of the gui
		 *********************************************************************************/
		 this.toggleActionbar = function() {
		 	actionbar_title.classList.toggle("hidden");
		 	actionbar_object.classList.toggle("hidden");
		 }

		 this.createTopicview = function() {
		 	crudops.createTopicview(topicid, topicid.replace(/_/g, " "), function(_topicviewObj) {
				// notify listeners for the given event
				eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "topicview", _topicviewObj));
			}.bind(this));
		 }

		 this.updateTopicview = function() {
			// here we toggle insertion of "_" vs. " " in the title text
			var title = titleel.innerHTML;
			console.log("title is: " + title);
			if (title.indexOf("_") != -1) {
				title = title.replace(/_/g, " ");
			} else {
				title = title.replace(/ /g, "_");
			}

			// if update is successful the callback will be passed the updated attributs, which are actually the ones we put in
			crudops.updateTopicview(topicid, {
				title : title
			}, function(update) {
				eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "updated", "topicview", update));
			}.bind(this));

		};

		this.addContentItem = function(item) {
			crudops.addContentItem(topicid, item, function(err,data) {
				if (!err)
					eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "added", "contentItems", data));
			}.bind(this));
		};

		this.removeContentItem = function(itemType) {
			crudops.removeContentItem(topicid, itemType, function(err,data) {
				if (!err)
					eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "added", "contentItems", data));
			}.bind(this));
		};

		this.deleteTopicview = function() {
			crudops.deleteTopicview(topicid, topicviewObj._id, function(deleted) {
				if (deleted) {
					eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "deleted", "topicview"));
				}
			}.bind(this));
		}
		

		/*
		 * NJM: these functions need to be implemented for the njm exercises
		 */
		 this.readObject = function() {
		 	if (!topicviewObj)
		 		return console.error('No topicview object');

		 	var len = topicviewObj.content_items.length;
		 	var objId;
		 	while (len--) {
		 		var contenItemData = topicviewObj.content_items[len];

		 		if (!contenItemData)
		 			continue;
		 		if (contenItemData.type == 'objekt') {
		 			objId = contenItemData.objektid || null;
		 			if (objId)
		 				break;
		 		}
		 	}

		 	/** NJM3 (1) **/
		 	if (objId) {
		 		crudops.readObject(objId,function(error,_objData) {
		 			if (error) 
		 				objData = null;
		 			else
		 				objData = _objData;
		 			eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "read", "object", objData));
		 		});
		 	}

		 }


		 this.createObject = function() {
			// TODO other object
			if (objData) {
				alert('Could not create an object, there is already one created');
				return;
			}
			objData = {
				src: null,
				title: 'Neues Objekt',
				description: 'Dies ist ein neues Objekt, dessen Werte noch befüllt werden müssen.'
			};
			crudops.createObject(objData, function(error,_Obj) {
				if (error) {
					return alert('Could not create a new object for this topicview');
				}
				// notify listeners for the given event
				eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "object", _Obj));
			}.bind(this));
		};

		this.updateObject = function() {
			crudops.updateObject(objData, function(_topicviewObj) {
				// notify listeners for the given event
				eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "updated", "object", _topicviewObj));
			}.bind(this));
		};

		this.deleteObject = function() {
			crudops.deleteObject(objData._id, function(_topicviewObj) {
				// notify listeners for the given event
				eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "deleted", "object", _topicviewObj));
			}.bind(this));
		}
		;
		/*********************************************************************************
		 * MFM: these functions are used for displaying the einfuehrungstext element
		 *********************************************************************************/
		 function createEinfuehrungstext(contentItem) {
		 	console.log("createEinfuehrungstext()");

			// we determine to which column the element shall be added
			var column = document.getElementById("column_" + contentItem.render_container);

			// then we create the element dynamically
			var section = document.createElement("section");
			section.id = "einfuehrungstext";
			var div1 = document.createElement("div");
			div1.classList.add("contentfragment");
			section.appendChild(div1);
			var div2 = document.createElement("div");
			div2.classList.add("fullcontent_link");
			section.appendChild(div2);
			var a = document.createElement("a");
			div2.appendChild(a);
			a.href = "#";
			a.appendChild(document.createTextNode("weiter lesen"));
			// append the section to the column
			column.appendChild(section);

			// check whether we have a text attribute that specifies the text that shall be displayed
			if (contentItem.txt) {
				div1.innerHTML = contentItem.txt;
			} else {
				// then we access the server and load the content into the section element - it is ok to do this here rather than in the model operations as we simply access a resource whose url is given by the src attribute
				iam.xhr.xhr("GET", contentItem.src, null, function(xmlhttp) {
					console.log("received response for textauszug");
					div1.innerHTML = xmlhttp.responseText;
				});
			}
		}
		/*
		 * multipart responses will result in invoking this method via a <script> element sent to the page's iframe
		 */
		 this.onMultipartResponse = function(mpuri, mpobj) {
		 	console.log("onMultipartResponse: " + mpobj);
			// check which kind of object we have created by the multipart request
			switch (mpobj.type) {
				case "einfuehrungstext":
				eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "uploaded", "einfuehrungstext", mpobj));
				break;
			}
		}
	}

	// a factory method
	function newInstance() {
		return new TopicviewViewController();
	}

	// export the factory method
	iammodule.controller.topicview = {
		newInstance : newInstance
	}

	// return the module
	return iammodule;

})(iam || {});
