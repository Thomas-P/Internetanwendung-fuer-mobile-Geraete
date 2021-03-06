define('crud',function(debug, xhr) {

	debug = debug.createConsole('crud');
	debug.log('module loaded');
	
	xhr('test.html',function(err,test) {

	});



});

var iam =

/**
 * @author Jörn Kreutel
 */
 (function(iammodule) {

 	console.log("loading TopicviewCRUDOperations as submodule crud.remote of: " + iammodule);


	// we declare the xhr function from the iam.xhr submodule as a local variable for avoiding necessity of fully qualifying each function call iam.xhr.xhr()
	var xhr = iammodule.xhr.xhr;
	// we add another submodule for different implementations
	if (!iammodule.crud) {
		iammodule.crud = {};
	}

	function TopicviewCRUDOperations() {

		/*
		 * the crud operations should not use any instance attributes representing "state", configuration information or state information indicating whether we are offline or online could be represented by attributes, though
		 */

		 this.initialise = function(callback) {
		 	callback();
		 }

		 this.createTopicview = function(topicid, title, callback) {

		 	console.log("createTopicview()");

			/*
			 * we create a default topicview entry that contains the topicid and a title created from the id. We also add an empty list content_item that will contain the content items  (textauszug, kommentar, objekt, etc.) used for this view
			 */
			 xhr("POST", "http2mdb/topicviews", {
			 	topicid : topicid,
			 	title : title,
			 	content_items : []
			 }, function(xmlhttp) {
				// parse the response body
				var json = JSON.parse(xmlhttp.responseText);

				/* this is for providing an example for NJM3: we show how a new element can be added to the content_items list */

				// send another xhr adding some dummy element to the content_items list - note that the url is created by adding the static segment "/content_items" behind the dynamic segment that specifies the topicid. This url pattern is then evaluated in the http2mdb script's updateTopicview() function
				xhr("PUT", "http2mdb/topicviews/" + topicid + "/content_items", {
					type : "demo_element",
					render_container : "none"
				}, function(xhr) {
					if (callback) {
						callback(json);
					} else {
						// we update the title element
						titleel.innerHTML = json.title;
						// we deactivate the createTopicview() action
						document.getElementById("createTopicviewAction").href = "#";
					}

				});
			});

}

this.readTopicview = function(topicid, callback) {

	console.log("readTopicview()");

			// we read out a topicview for a given topicid, appending the id on the base url for the topicviews
			xhr("GET", "http2mdb/topicviews/" + topicid, null, function(xmlhttp) {
				// parse the response body
				var json = JSON.parse(xmlhttp.responseText);
				// pass the object to the callback if we have one
				if (callback) {
					callback(json);
				}
			}, function(xmlhttp) {
				console.log("topicview probably does not exist. Got status code: " + xmlhttp.status);
				if (callback) {
					callback();
				}
			});

		}
/*
 * the server-side implementation of this function demonstrates how the ids assigned internally by mongodb are handled, therefore we pass both the manuylly assigned topicid (e.g. die_umsiedlerin) and the internal id
 */
 this.deleteTopicview = function(topicid, topicid_internal, callback) {

 	console.log("deleteTopicview()");

	// if we do not have a callback (i.e. if the function is called from the footer):
	// show how to delete an element from a collection that is contained in another element - note that we use the value of the type attribute ("demo_element") as identifier - for Objekt this could be dealt with anagously
	if (!callback) {
		xhr("DELETE", "http2mdb/topicviews/" + topicid + "/content_items/demo_element", {
			type : "demo_element",
			render_container : "none"
		}, function(xmlhttp) {
			console.log("got response from deletion of demo_element from content_items: " + xmlhttp.responseText);
			var deletedItem = parseInt(xmlhttp.responseText);
			if (deletedItem < 1) {
				alert("demo_element could not be deleted!");
			} else {
				console.log("demo_element was deleted successfully");
			}
			// we then delete the rest of the topicview
			xhr("DELETE", "http2mdb/topicviews/" + topicid_internal, null, function(xmlhttp) {
				var deleted = parseInt(xmlhttp.responseText);
				if (deleted > 0) {
					if (callback) {
						callback(true);
					}
				} else {
					alert("The topicview element could not be deleted!");
				}
			});

		});
	} else {
		// for deleting a topicview we also identify it using the topicid
		xhr("DELETE", "http2mdb/topicviews/" + topicid_internal, null, function(xmlhttp) {
			var deleted = parseInt(xmlhttp.responseText);
			if (deleted > 0) {
				if (callback) {
					callback(true);
				} else {
					titleel.innerHTML = "Lorem Ipsum";
				}
			} else {
				alert("The topicview element could not be deleted!");
			}
		});
	}

}

		this.updateTopicview = function(topicid, update, callback) {

			console.log("updateTopicview()");

			// for updating, we identify the topicview passing the id and then only pass the attributes to be updated
			xhr("PUT", "http2mdb/topicviews/" + topicid, update, function(xmlhttp) {
				var updated = parseInt(xmlhttp.responseText);
				// if the update was successful, we update the title
				if (updated > 0) {
					if (callback) {
						callback(update);
					} else {
						titleel.innerHTML = title;
					}
				} else {
					alert("The topicview element could not be updated!");
				}
			});

		};
		/** NJM3 (3) nur content_items via REST einfügen **/

		this.addContentItem = function(topicid,contentItem, callback) {

			// for updating, we identify the topicview passing the id and then only pass the attributes to be updated
			xhr("PUT", "http2mdb/topicviews/" + topicid + "/content_items", contentItem, function(xmlhttp) {
				var updated = parseInt(xmlhttp.responseText);
				// if the update was successful, we update the title
				if (updated > 0) {
					return callback && callback(null,true);
				} else {
					alert("The topicview element could not be updated!");
					return callback && callback(true,null);
				}
			});
		};
		/** NJM3 (4) content_items via REST leeren **/
		this.removeContentItem = function(topicid,itemType, callback) {

			xhr("DELETE", "http2mdb/topicviews/" + topicid + "/content_items/" + itemType , null, function(xmlhttp) {
				var updated = parseInt(xmlhttp.responseText);
				// if the update was successful, we update the title
				if (updated > 0) {
					return callback && callback(null,true);
				} else {
					alert("The topicview element could not be updated!");
					return callback && callback(true,null);
				}
			});
		};

		/*
		 * these functions need to be implemented for the njm exercises
		 */

		 this.createObject = function(obj, callback) {
		 	xhr("POST", "http2mdb/objects/", obj, function(xmlhttp) {

		 		// parse the response body
				var json = JSON.parse(xmlhttp.responseText);
				if (callback)
					return callback(null, json);

		 	}, function(xmlhttp) { // handle error function
		 		
				// Error callback
		 		return callback && callback(Error("Couldn't create this object."),null);
		 	});

		 }

		 this.readObject = function(objid, callback) {
		 	xhr("GET", "http2mdb/objects/" + objid, null, function(xmlhttp) {
				// parse the response body
				var json = JSON.parse(xmlhttp.responseText);
				// pass the object to the callback if we have one
				if (callback) {
					callback(null,json);
				}
			}, function(xmlhttp) {
				console.log("topicview probably does not exist. Got status code: " + xmlhttp.status);
				if (callback) {
					callback(Error("topicview probably does not exist. Got status code: " + xmlhttp.status),null);
				}
			});
		 }

		 this.updateObject = function(obj, callback) {
		 	xhr("PUT", "http2mdb/objects/" + obj.id, obj, function(xmlhttp) {
		 		var updated = parseInt(xmlhttp.responseText);
		 		if (updated > 0) {
		 			if (callback) {
		 				callback(true);
		 			}
		 		} else {
		 			alert("The object element could not be deleted!");
		 		}
		 	});
		 }

		 this.deleteObject = function(objid, callback) {
		 	xhr("DELETE", "http2mdb/objects/" + objid, null, function(xmlhttp) {
		 		var deleted = parseInt(xmlhttp.responseText);
		 		if (deleted > 0) {
		 			if (callback) {
		 				callback(true);
		 			}
		 		} else {
		 			alert("The object element could not be deleted!");
		 		}

		 	});
		 }
		/*
		 * this function is needed for creating the objectlist view
		 */
		 this.readAllObjects = function(callback) {

		 }
		}

	// a factory method
	function newInstance() {
		return new TopicviewCRUDOperations();
	}

	// export the factory method
	iammodule.crud.remote = {
		newInstance : newInstance
	}

	// return the module
	return iammodule;

})(iam || {});
