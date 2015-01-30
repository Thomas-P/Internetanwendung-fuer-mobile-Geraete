var formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    domain = require('domain');
var fs = require('fs')

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var myDomain = domain.create();
    myDomain.on('error',function(err) {

        console.log("http request callback: got an unhandled exception!");
        console.log(err.stack);
        if (res) {
            console.log("http request callback: finishing response on error...");
            return returnError(500,res);
        }
        console.log("http request callback: response is null. No need to finish...");

    });


	myDomain.run(function() {

	    var form = new formidable.IncomingForm();
	    form.uploadDir = process.cwd() + '/../webcontent/upload/';
	    form.maxFieldsSize = 10 * 1024 * 1024; // 10Mib
	    form.on('fileBegin', function(name, file) {
	    	// check images
	    	if (!file || !file.type || !file.type.startsWith || !file.type.startsWith('image')){
	    		this.emit('error')
	    	}
		});	
		form.on('file', function(name, file) {
			if (!file || !file.type || !file.type.startsWith || !file.type.startsWith('image')){
				console.log('Try to unlink', file.path)
				fs.unlinkSync(file.path);
	    	}
		});		

	    form.parse(req, function(err, fields, files) {
	      res.writeHead(200, {'content-type': 'text/plain'});
	      res.write('received upload:\n\n');
	      res.end(util.inspect({fields: fields, files: files}));
	    });

	    form.on('error',function(error) {
	    	req.socket.end();
	    })

   	})


    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="put">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(8080);