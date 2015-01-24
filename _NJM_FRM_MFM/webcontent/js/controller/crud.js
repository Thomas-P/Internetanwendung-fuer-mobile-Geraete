define('crud',function(debug, crudServer, crudLokal, eventHandler) {

	debug = debug.createConsole('controller/crud');
	debug.log('module loaded');
	return crudLokal;
	
});