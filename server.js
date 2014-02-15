'use strict';

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler());

app.set('view engine', 'jade');

var movies = { results: ['A', 'B', 'C'] };

app.get('*', function(req, res) {
    res.render('index', { movies: movies });
});

app.listen(8000);
console.log('Running server at port 8000');