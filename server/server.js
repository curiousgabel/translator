var express = require('express');
const url = require('url');
const ws = require('nodejs-websocket');
const GoogleTranslator = require('./lib/translator/GoogleTranslator');

// Setup the websocket connection
var wsServer = ws.createServer(function(conn){
	conn.on('text', function(message) {
		let connections = wsServer.connections.filter(c => c.path == conn.path);
		connections.forEach(function(c) {
			c.send(message);
		});
	});

	conn.on('error', function(){
		// Do nothing
	});
}).listen(8081); // TODO: Make port a config

var server = express();

// Enable CORS on webserver
server.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Endpoint for translating text
server.get('/translate', (request, response) => {
	const params = url.parse(request.url,true).query;

	GoogleTranslator.translate(params['from'], params['to'], params['text']).then(
		function(r) {
			console.log('handling response', r);
			response.status(200).json({ text:  r});
	});
});

// Endpoint for generating an unused channel ID
server.get('/generateChannelId', (request, response) => {
	var result;
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const params = url.parse(request.url,true).query;

	if (params['preferredChannelId']) {
		result = params['preferredChannelId'];
	}

	while (!result || wsServer.connections.filter(c => c.path == '/'+result).length > 0) {
		result = '';
		for ( var i = 0; i < 6; i++ ) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}

	}

	response.status(200).json({ channelId:  result});
});

// Start the webserver listening
server.listen(8080, () => {
  console.log('Server started on: ' + 8080);
}); // TODO: Make port a config