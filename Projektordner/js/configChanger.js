/**
*	create a config Box to switch the config state
*	appends this to 
*	@dependencies
*		xhr
*		viewController
*/
var createConfigChange = function() {
	// placeholder <span id="configChanger" data-config-url="data/config.json"/>
	var configChangeElement = document.getElementById('configChanger');
	if (!configChangeElement || !configChangeElement.dataset || !configChangeElement.dataset.configUrl) {
		console.error('Could not find the config placeholder with id #configChanger and a field named data-config-url');
		return;
	}

	var configUrl = configChangeElement.dataset.configUrl;

	// event listener for configBox
	var changeConfigEvent = function(event) {
		event.preventDefault();
		var file = event.srcElement.value;
		// generate a new view
		viewController(file);
	};

	// function for converting data
	// object key:value
	var createConfigBox = function(configFiles) {
		// <select name="configChanger" class="config-box" />
		var selectBox = document.createElement('select');
		selectBox.name = 'configChanger';
		selectBox.addEventListener('change',changeConfigEvent);
		selectBox.classList.add('config-box');
		var option;
		for (var key in configFiles) {
			option = document.createElement('option');
			option.value = configFiles[key];
			option.appendChild(
				document.createTextNode(key));
			selectBox.appendChild(option);
		}
		// finished selectBox added to the placeholder
		configChangeElement.appendChild(selectBox);
		// load first config by firering event
		if ("createEvent" in document) {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent("change", false, true);
			selectBox.dispatchEvent(evt);
		}
		else {
			selectBox.fireEvent("onchange");
		}

	};

	var isError = function(text) {
		alert(text);
	};

	// loading config
	xhr(configUrl)
	.then(createConfigBox)
	.catch(isError);
};
// add to load Event
window.addEventListener('load',createConfigChange);