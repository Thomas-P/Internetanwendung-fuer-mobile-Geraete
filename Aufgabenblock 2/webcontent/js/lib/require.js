/**
*	little lightweight framework to create modular code
*	@author thomas-p
*
*/

(function(window) {

	window = window || {};

	var dependencies = {};

	
	/**
	*	extract function parameter from a given function
	*	@from require.js
	*	@return Array with argument names
	**/
	var getArguments = function(func) {
		var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
		var args = func.toString().match(FN_ARGS)[1].split(',');
		return args;
	};
	

	/**
	*	helper method for getting depencies by giving a field of depency names
	*	@return array of dependencies
	*/
	var resolveDependencies = function(deps) {
		var resolveDeps = [];
		if (deps && deps.forEach) {
			deps.forEach( function(name) {
				name = String(name).trim();
				resolveDeps.push( dependencies[name] );
			} );
		}
		return resolveDeps;
	};

	
	/**
	*	allowes two ways of requiring modules
	*	
	* 	require([ '$dep1','$dep2', ...], function($dep1,$dep2, ...) { ... })
	*
	*	or 
	*
	*	require( function($dep1,$dep2, ...) { ... })
	*
	*	@note  this function isn't robust. Do not call on other ways
	*/
	var require = function() {
		if (1 < arguments.length) {
			names = arguments[0];
			func = arguments[1];
		} else {
			func = arguments[0];
			names = getArguments(func);
		}

		var dependencies = resolveDependencies(names);

		return func.apply(func,dependencies);
	};

	/**
	*	allowes two ways of requiring modules
	*	
	* 	define(moduleName, [ '$dep1','$dep2', ...], function($dep1,$dep2, ...) { ... })
	*
	*	or 
	*
	*	define(moduleName, function($dep1,$dep2, ...) { ... })
	*
	*	@note  this function isn't robust. Do not call on other ways
	*/
	var define = function() {
		if (0 == arguments.length)
			return;
		var module = arguments[0];
		var args = Array.prototype.slice.call(arguments,1);
		dependencies[module] = require.apply(this,args);
	};

	window.require = require;
	window.define = define;

})(window);