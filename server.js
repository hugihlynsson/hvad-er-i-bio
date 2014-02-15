'use strict';

var http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<!doctype html><html><head><meta charset="UTF-8"></head><body><h1>Hvað er í bíó?</h1></body></html>');
});

server.listen(8000);
console.log('Running server at port 8000');