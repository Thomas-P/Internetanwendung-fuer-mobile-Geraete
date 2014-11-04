/**
 * @author Ganna Demydova, Thomas Puttkamer
 */
window.onload = function() {

	document.getElementById('detailsansicht').onclick = function() {
		document.getElementsByTagName('body')[0].className += 'detail';
		return false;
	}

	document.getElementById('zurueck').onclick = function() {
		if (document.getElementsByTagName('body')[0].className == "detail")
			document.getElementsByTagName('body')[0].className = '';
		return false;
	}
}

