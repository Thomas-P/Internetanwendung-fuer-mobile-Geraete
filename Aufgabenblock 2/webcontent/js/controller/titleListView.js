define('titleListView', function(xhr, helper) {
	/**
	* load title to the title list an show them in the context
	*/
	function loadTitleList() {
		xhr("data/titlelist.json")
			// convert to json if it is a string
			.then(function(titleList) {
				if ("string" == typeof titleList)
					titleList = JSON.parse(titleList);
				return titleList;
			})
			// create the titleList
			.then(function(titleList) {
				return createTitleList(titleList);
			})
			// catch the error if there is an error
			.catch(function(err) {
				alert("Could\'nt load title list.");
				console.error('No title list',err);
			});
	}
	/**
	* main method to create a title list from a given datastructure
	*/
	function createTitleList(titleList) {
		var contentView = document.getElementById("contentview");

		// create the list element - we will add it at the very end of processing the input data to avoid formatting for each new element
		var ul = document.createElement("ul");

		titleList.forEach(function(element) {
			if (!element.uri)
				return;
			var data = element.uri.split('#');
			var title = data[data.length-1].replace(/_/g, " ");
			// elements for List
			var li = document.createElement("li");
			var span = document.createElement("span");
			var link = document.createElement("a");
			var text = document.createTextNode(title);
			// build link element
			link.appendChild(text);
			link.setAttribute("class", "title");
			link.href = 'topicview.html?topic=' + encodeURIComponent(title);

			// this is the notation for "replace all" ("g" stands for "global")
			//a.appendChild(document.createTextNode(iam.sharedutils.substringAfter(currentTitle, "#").replace(/_/g, " ")));
			//a.href = /*currentTitle;*/"javascript:iam.navigation.loadTopicview(\'" + iam.sharedutils.substringAfter(currentTitle, "#") + "\')";

			span.appendChild(link);
			li.appendChild(span);
			ul.appendChild(li);
		});

		contentView.appendChild(ul);

		var elements = contentView.querySelectorAll('a');
		var position = elements.length;
		var maxWidth = ul.getBoundingClientRect().width;
		while (position--) {
			fitWidth(elements[position],maxWidth,5,0.95);
		}
		return true;
	}

	/**
	* fit the size of the text to the width
	*/
	function fitWidth(element,maxWidth,margin,buffer) {
		buffer = buffer || 1;
		var size = document
			.defaultView
			.getComputedStyle(element,null)
            .getPropertyValue('font-size');
        var sizeFloat = parseFloat(size);
        var sizeType  = size.split(sizeFloat)[1];

        var factor = (maxWidth-margin)/element.getBoundingClientRect().width;

        sizeFloat*=factor*buffer;

        element.style.setProperty('font-size',sizeFloat + sizeType);
	}

	// Call loadlist, when DOM ready
	helper.domReady(loadTitleList);

});
