define('topicView',function(debug,crud) {

	debug = debug.createConsole('topicViewController');
	debug.log('module loaded');

	var topicView = {};

	var notifyCrudEvent = function(type,object) {
		var event = new eventHandler.customEvent("crud",type,"topicView",object);
		eventHandler.notifyListeners(event);
	};

	/**
	* 
	*/
	var createTopicView = function() {
		crud.createTopicview(topicid, topicid.replace(/_/g, " "),function(err,topicObject) {
			if (err) {
				return;
			}
			return notifyCrudEvent("created",topicObject);

		});
	};

});