/**
*	xhr request with promise style
*	@param url 		is the requested uri
*	@param options	object that can contain
*		method	request method (default get)
*		data	data (method post, put)
*	chain with .then(data) and .catch(data)
*/
var xhr = function(url,options) {
	// create Promise.defer object
	var deferred = Promise.defer();
	if (!url)
		deferred.reject(Error('No url given'));
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
		xmlhttp.send(JSON.stringify(obj));
	} else {
		xmlhttp.send();
	}
	// return the promise
	return deferred.promise;
};