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


	// http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
	helper.getQueryVariable = function(variable) {
	    var query = window.location.search.substring(1);
	    var vars = query.split('&');
	    for (var i = 0; i < vars.length; i++) {
	        var pair = vars[i].split('=');
	        if (decodeURIComponent(pair[0]) == variable) {
	            return decodeURIComponent(pair[1]);
	        }
	    }
	    console.log('Query variable %s not found', variable);
	}


	helper.clone = function(obj) {
	    if (null == obj || "object" != typeof obj) return obj;
	    var copy = obj.constructor();
	    for (var attr in obj) {
	        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	    }
	    return copy;
	}

	helper.domReady = function(callback) {
		// Call functions
		document.addEventListener('DOMContentLoaded',callback);
	}

	helper.getDomElement = function(element) {
		var domElement;
		if ('string' == typeof element) 
			domElement = document.querySelector(element);
		else 
			domElement = element;
		if (element && !domElement)
			console.error('helper.getDomElement::Could not find an domElement for ',element);
		return domElement;
	}

	/**
	*
	*/
	helper.moveDomElements = function(element, target, insertBefore ) {
		element = helper.getDomElement(element);
		target = helper.getDomElement(target);
		insertBefore = helper.getDomElement(insertBefore);
		if ( !(element && target) )  {
			console.error('helper.moveDomElements::element or target not findable.',element,target);
			return null;
		}
		if (insertBefore)
			target.insertBefore(element, insertBefore);
		else
			target.appendChild(element);
		return element;
	}

	return helper;


});
