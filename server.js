String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var express = require ('express')
var app = express();
var fs = require('fs')

app.use(express.static(__dirname))
app.get('*',function(req,res,next) {
	if (req.url.endsWith('/favicon.ico'))
		return next();
	if (!req.url.endsWith('/')) {
		res.status(404);
		return next();
	}
	fs.readdir(__dirname + '/' + req.url, function(err, data) {
		if (err) {
			res.send('<!doctype html><html><head><title>Index</title></head><body><h1>Error</h1>'+'<p>Couldn\'t read path</p></body></html>');
			return next(err)
		}
		var out = '<!doctype html><html><head><title>Index</title></head><body><h1>Index</h1><ul>' 
		data.forEach(function(el) {
			out+= ('<li><a href="' + el + '">' + el + '</a></li>')
		})
		res.send(out + '</ul></body></html>');
		return next()
	});
});

app.listen(1337);