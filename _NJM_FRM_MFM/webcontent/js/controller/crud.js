define('crud',function(debug, crudServer, crudLokal, eventHandler, helper) {

	debug = debug.createConsole('controller/crud')
	debug.log('module loaded')

	var useCrudLocal = false
	var useCrudServer = false

	var activeLocal = false
	var activeServer = false
	var activeCrud = false

	// Storage if a api not ready
	var storeQueue = []

	/**
	*	extract function parameter from a given function
	*	@from require.js
	*	@return Array with argument names
	**/
	var getArguments = function(func) {
		var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m
		var args = func.toString().match(FN_ARGS)[1].split(',')
		return args
	}
	
	/**
	*	calls the operation for Crud
	*/
	function callCrudOperation(operation,argumentList) {
		// Crud operations not active
		if (!activeLocal && !activeServer && !activeCrud) {
			console.log('Store Operations, because Crud is not ready',operation,argumentList)
			// store in storeQueue
			return storeQueue.push(arguments)
		}
		// do all stored Crud Operations
		if (storeQueue.length) {
			var backup = storeQueue
			storeQueue = []
			backup.forEach(function(args) {
				callCrudOperation.apply(null,args)
			})
		}
		if (!operation)
			return
		// check the strategy
		if (useCrudLocal && useCrudServer) {
			// both
		} else if (useCrudServer || useCrudLocal) {
			// one of them
			var useCrud = useCrudServer ? crudServer : crudLokal;
			if (useCrud[operation])
				useCrud[operation].apply(null,argumentList);
			else
				console.error('Operation',operation,'not implemented in',useCrudServer ? 'crudServer' : 'crudLokal' )
		}
	}
 
	function prepareCrudOperation(operation) {
		// returns a function, that stores the operation
		return function () {
			callCrudOperation(operation,arguments)
		} // end Inner Function useCrudOperation
	}

	function prepareOperations() {
		var operations = {}
		// for crud Server
		for (var key in crudServer) {
			if ('onStart' == key || operations[key])
				continue
			operations[key] = prepareCrudOperation(key)
		}
		// for crud Local
		for (var key in crudLokal) {
			if ('onStart' == key || operations[key])
				continue
			operations[key] = prepareCrudOperation(key)
		}
		return operations
	}
	
	var operations = prepareOperations()

	// create domController, should be separated

	function setDisabled(element,status) {
		var element = document.getElementById(element);
		if (!element)
			return;
		element.disabled = !status;

	}

	function setMode (event) {
		event.target.removeEventListener('click',setMode)
		event.preventDefault();
		var crudControl = document.querySelector('.crud-control')
		var crudElement = document.getElementById('crudLocal');
		if (crudElement && !crudElement.disabled) {
			useCrudLocal = !!crudElement.checked
		}
		var crudElement = document.getElementById('crudServer');
		if (crudElement && !crudElement.disabled) {
			useCrudServer = !!crudElement.checked
		}
		if (crudControl && crudControl.parentElement) {
			crudControl.parentElement.removeChild(crudControl)
		}
		// set against the activation 
		useCrudServer = useCrudServer && activeServer;
		useCrudLocal = useCrudLocal && activeLocal;
		// clear Queue if them exists
		callCrudOperation();
	}

	function initialize() {
		crudLokal.onStart(function(status) {
			activeLocal = !!status
			setDisabled('crudLocal',status)
			setDisabled('crudStart',status)
		});

		crudServer.onStart(function(status) {
			activeServer = !!status
			setDisabled('crudServer',status)
			setDisabled('crudStart',status);
		})

		var startButton = document.getElementById('crudStart')
		if (startButton) {
			startButton.addEventListener('click',setMode)
		}

	}

	helper.domReady(initialize);
	return operations
	
});