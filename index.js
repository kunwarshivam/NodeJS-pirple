/* Dependencies */

var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');


var httpServer = http.createServer(function(req, res){

	unifiedServer(req, res);

});

// start a HTTP server 
httpServer.listen(config.httpPort, function(){
	console.log('Server on ', config.httpPort);
});

httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res){
	unifiedServer(req, res);
});


httpsServer.listen(config.httpsPort, function(){
	console.log('Server on ', config.httpsPort);
});

var unifiedServer = function(req, res){
	// parse the url
	var parsedUrl = url.parse(req.url, true);

	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');

	var queryStringObject = parsedUrl.query;

	var method = req.method.toLowerCase();

	var headers = req.headers;

	var decoder = new StringDecoder('utf-8');

	var buffer = '';

	req.on('data', function(data){
		buffer += decoder.write(data);
	});

	req.on('end', function(){
		buffer += decoder.end();

		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath]: handlers.notFound;

		var data = {
			'queryStringObject': queryStringObject,
			'method': method,
			'payload': buffer,
			'headers': headers
		}

		chosenHandler(data, function(statusCode, payload){
			
			statusCode = typeof(statusCode) == 'number' ? statusCode: 200;

			payload = typeof(payload) == 'object' ? payload : {};

			var payloadString = JSON.stringify(payload);

			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			console.log('Response:', statusCode, payloadString);
		});

	});
};




var handlers = {};

handlers.hello = function(data, callback){
	var response = {
			'message': 'Hello from the server side!',
			'song': 'Hello',
			'artist': 'Adele'
		}
	console.log('answer:', data);


	callback(200, response);
}

handlers.notFound = function(data, callback){
	callback(404);
}

var router = {
	'hello': handlers.hello
}