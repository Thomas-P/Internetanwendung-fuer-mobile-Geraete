define('crud',function(debug, crudServer, crudLokal, eventHandler, helper) {

	debug = debug.createConsole('controller/crud')
	debug.log('module loaded')

	var useCrudLocal = false
	var useCrudServer = false

	var activeLocal = false
	var activeServer = false
	var activeCrud = false

	// Storage if a api not ready
	var _crudImplementationStart 
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
		if (!_crudImplementationStart) {
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
			// read lokal write both <--
			// read operation
			if (operation.indexOf('read') != -1) {
				crudLokal[operation].apply(null,argumentList);
			} else {
				// write the operation
				var twoTimes = 0;
				var twoTimesError = 0;
				var callback = (argumentList[argumentList.length-1])
				if ('function' == typeof callback) {
					argumentList[argumentList.length-1] = function(err,data) {
						if (err)
							return 
								callback.apply(null,arguments)
						argumentList[argumentList.length-1] = function(err,data) {
							return callback.apply(null,arguments);
						}
						crudServer[operation].apply(null,argumentList);
					}
					crudLokal[operation].apply(null,argumentList)
				} else {
					console.log('Could not find callback');
					crudLokal[operation].apply(null,argumentList);
					crudServer[operation].apply(null,argumentList);
				}
			}

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

	var started = false

	function setMode (event) {
		event.preventDefault();
		if (!started)
			setDone()
		event.target.removeEventListener('click',setMode)
	}

	function setDone() {
		started = true
		var crudControl = document.querySelector('.crud-control')
		var crudElement = document.getElementById('crudLocal');
		if (crudElement && !crudElement.disabled) {
			useCrudLocal = !!crudElement.checked
		}
		var crudElement = document.getElementById('crudServer');
		if (crudElement && !crudElement.disabled) {
			useCrudServer = !!crudElement.checked
		}
		// set against the activation 
		useCrudServer = useCrudServer && activeServer;
		useCrudLocal = useCrudLocal && activeLocal;

		if (useCrudServer) {
			var e1 = document.getElementById('crudServerShow');
			if (e1) {
				e1.classList.toggle('active')
			}
		}
		if (useCrudLocal) {
			var e1 = document.getElementById('crudLocalShow');
			if (e1) {
				e1.classList.toggle('active')
			}
		}
		if (!useCrudLocal && !useCrudServer) {
			return alert('No Implementation set')
		}
		crudControl.classList.toggle('crud-control-set');
		if (useCrudServer && useCrudLocal)
			crudServer.setEvents(false)
		/*
		if (crudControl && crudControl.parentElement) {
			crudControl.parentElement.removeChild(crudControl)
		}*/
		// clear Queue if them exists
		_crudImplementationStart = true
		callCrudOperation();

	}

	function initialize() {
		var count = 0;
		var startButton = document.getElementById('crudStart')

		var checkCount = function() {
			if (count<2)
				return
			if (activeLocal && !activeServer || !activeLocal && activeServer ) {
				setDone()				
			}
		}

		crudLokal.onStart(function(status) {
			activeLocal = !!status
			setDisabled('crudLocal',status)
			setDisabled('crudStart',status)
			count++
			checkCount()

		});

		crudServer.onStart(function(status) {
			activeServer = !!status
			setDisabled('crudServer',status)
			setDisabled('crudStart',status);
			count++;
			checkCount()
		})

		if (startButton) {
			startButton.addEventListener('click',setMode)
		}

	}

	helper.domReady(initialize);
	return operations
	
});