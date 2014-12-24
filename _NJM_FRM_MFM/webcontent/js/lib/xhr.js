define('xhr',function(debug) {

	debug = debug.createConsole('xhr');
	debug.log('module loaded');
	/**
	*	xhr request with promise style
	*	@param url 		is the requested uri
	*	@param options	object that can contain
	*		method	request method (default get)
	*		data	data (method post, put)
	*	@param callback old way, then not chainable
	*	chain with .then(data) and .catch(data)
	*/
	var xhr = function(url,options,callback) {
		debug.log('Request url: ',url,'with options/callback:',options,callback);
		var deferred = {};
		// implement an optional callback
		if (typeof arguments[arguments.length-1] == "function" ) {
			var callbackOptional = arguments[arguments.length-1];
			deferred.reject = function(prop) {
				callbackOptional(prop,null);
			};
			deferred.resolve = function(prop) {
				callbackOptional(null,prop);
			};
			deferred.promise = null;
		} else {
			// promise Style
			// create Promise.defer object
			if (Promise.defer) {
				deferred = Promise.defer();
			}
			else {
				deferred = {};
				deferred.promise = new Promise(function(resolve,reject) {
					deferred.resolve = resolve;
					deferred.reject = reject;
				});
			}
		}
		if (!url)
			return callbackOptional ? callbackOptional(Error('No url given'),null) : deferred.reject(Error('No url given'));
		url = String(url);
		if (url.indexOf("/") === 0) {
			url = /*webapp_basepath + */
			url.substring(1);
		} 
		// options as an object
		options = options || {};
		// exctract the method
		var method = String(options.method || 'GET');
		method.toUpperCase();
		// extract data
		var data = options.data || void 0;
		// create a xhr object
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open(method, url, true);
		// onLoad -> request successful
		xmlhttp.onload = function() {
			if (xmlhttp.status>=400) {
				return deferred.reject(Error('Ressource not found.'));
			}
			var contentType = xmlhttp.getResponseHeader("Content-type").toLowerCase();
			if (contentType.indexOf('json')==-1) 
				return deferred.resolve(xmlhttp.responseText);
			// return JSON
			return deferred.resolve(JSON.parse(xmlhttp.responseText));
		};
		// onError -> xhr failded
		xmlhttp.onerror = function(event) {
			deferred.reject(event);
		};
		xmlhttp.setRequestHeader("Accept", "application/json, application/xml, text/html, text/plain");
		if (data) {
			xmlhttp.setRequestHeader("Content-type", "application/json");
			xmlhttp.send(JSON.stringify(data));
		} else {
			xmlhttp.send();
		}
		// return the promise
		return deferred.promise;
	};

	return xhr;

});
