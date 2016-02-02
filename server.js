'use strict';

var fs = require('fs');
var express = require('express');
var request = require('request');
var jade = require('jade');
var Promise = require('bluebird');
var processMoviesJson = require('./processMoviesJson');


var app = express();
app.use(express.static(__dirname + '/public'));


// Wrap jade.renderFile in a promise
var renderJadeFile = function (path, data) {
    return new Promise(function(resolve, reject) {
        jade.renderFile(path, data, function(err, html) {
            if (err) reject(new Error(err));
            resolve(html);
        });
    });
};

var processedData;

// A function to update the renderedHtml to make Promise.then() nicer
var replaceHtml = function (html) { renderedHtml = html; };


// Initialize update to the beginning of Unix
var lastUpdate = new Date(0);

// The html to be serverd from memory
var renderedHtml;

// Start rendering the loading view
renderJadeFile('./views/loading.jade').then(replaceHtml).catch(console.log);

// Returns movie data. Demo data is returned if KVIKMYNDIR_KEY isn't set
var fetchData = function () {
    var kvikmyndirKey = process.env.KVIKMYNDIR_KEY;
    if (!kvikmyndirKey && app.get('env') !== 'production') {
        console.log('The kvikmyndir.is api key was not found, using demo data');
        return new Promise(function (resolve, reject) {
            fs.readFile('./data/demoData.json', function (err, data) {
                if (err) reject(new Error(err));
                else resolve(data);
            });
        });
    }
    return new Promise(function (resolve, reject) {
        var url = 'http://kvikmyndir.is/api/showtimes/?key=' + kvikmyndirKey;
        request.get({ url: url }, function (err, res, body) {
            if (err) reject(new Error(err));
            else if (res.statusCode !== 200) {
                reject(new Error('Faild to fetch data, got bad status: ' + res.statusCode));
            }
            else resolve(body);
        });
    });
};


// Update the rendered html with either fresh data or no-data and call itself
var updateData = function () {
    fetchData().then(JSON.parse).then(processMoviesJson).then(function (data) {
        processedData = data;
        return renderJadeFile('./views/index.jade', data);
    }).then(replaceHtml).then(function () {
        lastUpdate = new Date();
        console.log('Updated html with fresh data', lastUpdate);
        setTimeout(updateData, 30*60*1000);
    }).catch(function (err) {
        console.log(err.stack);
        if (lastUpdate.toDateString() !== new Date().toDateString()) {
            renderJadeFile('./views/no-data.jade').then(replaceHtml).catch(console.log);
        }
        setTimeout(updateData, 60*1000);
    });
};
updateData();

/**
 * Start server:
 */

app.get('/', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(renderedHtml);
});

app.get('/debug', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Last successful fetch: ' + lastUpdate);
});

app.get('/movies', function(req, res) {
  res.json(processedData && {movies: processedData.movies && processedData.movies.titles});
});

var port = (app.get('env') === 'production') ? 8000 : 8001;
app.listen(port);
console.log('Running server in ' + app.get('env') + ' envitonment at port ' + port);
