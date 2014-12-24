/**
* @author Jörn Kreutel
* @refactored by thomas-p
*/
define('eventHandler',function() {

	/*
	* some custom event class
	*/
	function customEvent( group, type, target, data) {
		// make it callable like a function but returns a custom event
		if ( true !== (this instanceof customEvent) )
			return new customEvent(group, type, target, data);

		this.group = group;
		this.type = type;
		this.target = target;
		if (data) {
			this.data = data;
		}
	}

	/*
	* declare some id function on CustomEvent (see for a non standard alternative: 
	* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/__defineGetter__
	*/
	CustomEvent.prototype.desc = function() {
		return (this.group ? this.group : "") + "_" + (this.type ? this.type : "") + "_" + (this.target ? this.target : "");
	};

	eventListeners = {};

	function addEventListener(event, callback) {
		// check whether the event type contains a "|" symbol that identifies more than a single event
		if ( -1 !== event.type.indexOf("|") ) {
			
			console.log("event specifies a disjunction of types: " + event.type + ". Will add a listener for each concrete type");
			
			var eventTypeArray = event.type.split("|");

			eventTypeArray.forEach(function(eventName) {
				addEventListener(customEvent(event.group, eventName, event.target), callback);
			});

		} else {

			console.log("adding new event listener for event " + event.desc());
			
			var eventDescription = event.desc();

			if ( !eventListeners[eventDescription] ) {

				console.log("creating new event listener list.");
				eventListeners[eventDescription] = [];

			}

			console.log("adding listener to listeners.");
			eventListeners[eventDescription].push(callback);

		}
	}


	function notifyListeners(event) {

		var eventDescription = event.desc();
		var eventList = eventListeners[eventDescription] || null;

		if (!eventList || 0 === eventList.length)
			return;

		eventList.forEach(function(eventFunction) {
			eventFunction(event);
		});

	}

	function removeEventListener(event,listener) {
		var eventDescription = event.desc();
		// no List?
		if (void 0 == eventListeners[eventDescription] )
			return;
		// in Index?
		var eventList = eventListeners[eventDescription];
		if (-1 == eventList.getIndex(listener))
			return;
		// remove all listeners like listener from list
		for (var index = 0; index < eventList.length; index ++) {
			if (eventList[index] === listener)
				eventList.splice(index,1);
		}
	}


	/**
	* make functions public for the module controller
	*/
	return  {
		customEvent : customEvent,
		addEventListener : addEventListener,
		removeEventListener: removeEventListener,
		notifyListeners : notifyListeners
	};
});