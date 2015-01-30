/*
 * taken from http://jmesnil.net/weblog/2010/11/24/html5-web-application-for-iphone-and-ipad-with-node-js/
 */
var util = require('util');
var http = require('http');
var url = require('url');
var fs = require('fs');
var sys = require('sys');
var domain = require('domain');

//var utils = require("./njsimpl/njsutils");
//var http2mdb = require("./njsimpl/http2mdb");

// the HTTP server
var server;
// the port on which the server will be started
var port = 8380;
// api 
var apiString = '/api';
// api collections
var collections = ['topicview','object'];
// databaseUrl
var databaseUrl = 'mme2db';

// the ip address
//var ip = utils.getIPAddress();

var supportContentTypes = {
    'js'    : 'text/javascript',
    'html'  : 'text/html',
    'css'   : 'text/css',
    'json'  : 'application/json',
    'png'   : 'image/png',
    'jpg'   : 'image/jpeg', 
    'jpeg'  : 'image/jpeg', 
    'ogv'   : 'video/ogg', 
    'ogg'   : 'audio/ogg', 
    'manifest' : 'text/cache-manifest', 
    'webapp'   : 'application/x-web-app-manifest+json'
}

var localPath = __dirname + "/../webcontent/";

var returnError = function(code, res) {
    res.writeHead(code);
    res.end();
};
// create a Rest Server module
var restServer = require('./restapi/rest.js')(apiString,{
    collections: collections,
    databaseUrl: databaseUrl,
    primaryKey: {
        'topicview' : 'title',
        'object'    : '_id'
    }
});

server = http.createServer(function(req, res) {
    // run a domain, to handle errors
    // http://shapeshed.com/uncaught-exceptions-in-node/
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

        var path = url.parse(req.url).pathname;
        console.log("http request callback: trying to serve path: " + path);

        // check whether we have an api call or need to serve a file
        /*
        if (path.indexOf(apiString) == 0) {
            console.log("http request callback: got a call to the http2mdb api. Will continue processing there...");
            return restServer.run(req, res);
        }
        */

        if (path == '/') {
            // if the root is accessed we serve the main html document
            path = "titlelist.html";
        }

        var extension = path.substr( (path.lastIndexOf('.') || -1) + 1 );

        path = localPath + path;    // append localPath
        // test against no file
        fs.stat(path,function(err,stats){
            if (err)
                return returnError(404,res);
            if (!stats.isFile())
                return returnError(403,res);
            var contentType = supportContentTypes[ extension ] || 'text/plain';
            res.writeHead(200, {
                'Content-Type' : contentType
            });
            // get content
            // piping is very efficient
            // https://github.com/substack/stream-handbook
            fs.createReadStream(path).pipe(res);
        });


    })

});

// let the server listen on the given port
server.listen(port);
//console.log("HTTP server running at http://" + ip + ":" + port);
console.log("HTTP server running at port:" + port);

// exception handling, see http://stackoverflow.com/questions/5999373/how-do-i-prevent-node-js-from-crashing-try-catch-doesnt-work
// possible memleak
process.on("uncaughtException", function(error) {
    console.log("http request callback: got an uncaught exception!");
    console.log(error.stack);
    console.log("http request callback: response is null. No need to finish...");
});
