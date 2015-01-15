/**
 * @author Jörn Kreutel
 * @refactored by Thomas-p
 */
define('navigation',function(debug) {
	var navigation = {};
	debug = debug.createConsole('navigation');
	debug.log('module loaded');

	var historyLengthOnLoad = window.history.length;
	
	/*
	* change the view by setting the html document for the 
	* follow-up view and adding the arguments as a query string
	*/
	navigation.nextView = function() {
		debug.log("about to access uri: " + uri);
		sessionStorage.setItem("previousView", window.location);
		window.location = uri + "?args=" + JSON.stringify(args);
	};

	/*
	 * go back to the previous view using the history
	 */
	navigation.previousView = function() {
		var currentHistoryLength = window.history.length;

		// the comparison of current length to length on load 
		// succeeds in most cases, but not always 
		// (need to investigate further, problems occur when using the tab view) - 
		// use sessionStorage instead, but note that this will push a new element 
		// to the history rather than popping of elements from it
		debug.log("previousView(): history length is: " + currentHistoryLength + "/" + 
			historyLengthOnLoad);
		// we need to go one step further back than behind the beginning
		var step = (currentHistoryLength - historyLengthOnLoad) + 1;
		debug.log("previousView(): going back " + step + " views...");
		//history.go(-step);
		var previousView = sessionStorage.getItem("previousView");

		// note that this solution will append the history:
		if (previousView) {
			debug.log("previousView(): going back to previousView fro session storage: " + previousView);
			window.location = previousView;
		} else {
			debug.log("previousView(): no previousView specified in session storage. Going back one step in history.");
			history.go(-1);
		}
	};

	/*
	* get the arguments that might have been passed when calling the view
	*/
	navigation.getViewargs = function() {
		debug.log("getViewargs(): search string is: " + window.location.search);
		var argstr = decodeURIComponent(window.location.search.substring("?args=".length));
		var args = JSON.parse(argstr);

		return args;
	};

	/*
	 * show the topicview for some topicid (the topicview is the "overview" view that we have been working with so far)
	 */
	navigation.loadTopicview = function (topicid, typed_overview_prefix) {
		debug.log("loadTopicview(): " + topicid);

		nextView("topicview.html", {
			"topicid" : topicid
		});
	};



	return navigation;
});