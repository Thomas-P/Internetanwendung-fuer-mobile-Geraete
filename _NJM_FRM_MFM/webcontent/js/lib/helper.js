/**
*	@author Jörn Kreutel
*	@refactored by thomas-p (2014)
*	replaced sub module pattern by modul load pattern like require.js
*	http://stackoverflow.com/questions/7508905/how-to-make-a-submodule-via-module-pattern
*/
define('helper',function(debug) {
	debug = debug.createConsole('helper');
	debug.log('module loaded');

	var helper = {};

	/**
	* @author Jörn Kreutel
	* utility: remove all child elements from a node
	*/
	helper.clearNode = function clearNode(node) {
		while (node.firstChild) {
			debug.log("removing child node: " , node.firstChild);
			node.removeChild(node.firstChild);
		}
	};


	/*
	* utility treat null as empty string
	*/
	helper.nullAsEmptyString = function nullAsEmptyString(val) {
		return (val === null ? "" : val);
	};

	/*
	* some substring functionality
	*/
	helper.substringAfter = function substringAfter(string, separator) {
		var split = string.split(separator);

		var rest = "";
		for (var i = 1; i < split.length; i++) {
			if (i != 1) {
				rest += separator;
			}
			rest += split[i];
		}

		return rest;
	};

	helper.startsWith = function startsWith(string, substring) {
		return string.indexOf(substring) === 0;
	};

	helper.endsWith = function endsWith(string, substring) {
		if (!string || !substring) {
			return false;
		}
		return string.length >= substring.length && string.substring(string.length - substring.length) == substring;
	};


	return helper;


});