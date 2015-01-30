define('debug',function() {

	var logDisabled = {};
	var debug = {};
	log_methods = [ 'error', 'warn', 'info', 'debug', 'log' ];

	/**
	* create a closure that allowes us to define a module and switches 
	* 
	*/
	debug.createConsole = function(module) {

		var myConsole = {};
		// wrapping a console
		// see also: https://github.com/cowboy/javascript-debug/blob/master/ba-debug.js
		var index = log_methods.length;
		while (index--) {

			(function(method) {
				
				myConsole[method] = function() {
					if ( logDisabled[module] )
						return;
					window.console.log( '%c' + method + ':' + module, 'color: blue;', Array.prototype.slice.call(arguments) );
				};

			})(log_methods[index]);

		}

		return myConsole;
	};


	debug.disableLogging = function disableLogging(module) {
		logDisabled[ module ] = true;
	};


	debug.enableLogging = function enableLogging(module) {
		logDisabled[ module ] = false;
	};


	debug.setLogging = function setLogging(module,value) {
		logDisabled[ module ] = !value;
	};

	return debug;
});