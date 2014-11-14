/**
 * @author Ganna Demydova, Thomas Puttkamer
 */
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
window.onload = function() {

	document.getElementById('detailsansicht').onclick = function() {
		
		document.getElementsByTagName('main')[0].classList.remove('is-paused');
		setTimeout(function(){
    		document.getElementsByTagName('body')[0].className += 'detail';
    		document.getElementsByTagName('main')[0].classList.remove('fade-out');
	    	document.getElementsByTagName('main')[0].className += ' fade-in';
	    	setTimeout(function(){
	    		document.getElementsByTagName('main')[0].classList.remove('fade-in');
	    		document.getElementsByTagName('main')[0].className += ' fade-out is-paused';
			}, 2000);
		}, 2000);
		
		return false;
	}

	document.getElementById('zurueck').onclick = function() {
		
			
		if (document.getElementsByTagName('body')[0].className == "detail")
		{	
		document.getElementsByTagName('main')[0].classList.remove('is-paused');
		setTimeout(function(){
    		document.getElementsByTagName('body')[0].className = '';
    		document.getElementsByTagName('main')[0].classList.remove('fade-out');
	    	document.getElementsByTagName('main')[0].className += ' fade-in';
	    	setTimeout(function(){
	    		document.getElementsByTagName('main')[0].classList.remove('fade-in');
	    		document.getElementsByTagName('main')[0].className += ' fade-out is-paused';
			}, 2000);
		}, 2000);
		}
		return false;
	}
}