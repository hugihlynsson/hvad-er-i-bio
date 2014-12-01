'use strict';

var express = require('express');
var request = require('request');
var jade = require('jade');
var processMoviesJson = require('./processMoviesJson');

var app = express();
app.use(express.static(__dirname + '/public'));


 // Initialize update to the beginning of Unix
 var lastUpdate = new Date(0);

// Start rendering the loading view
var renderedHtml;
jade.renderFile('./views/loading.jade', function (err, html) {
    if (err) console.log('Failed to render loading.jade', err);
    else renderedHtml = html;
});


var getMoviesData = function (cb) {
    var url = 'http://kvikmyndir.is/api/showtimes/?key=' + process.env.KVIKMYNDIR_KEY;
    request.get({ url: url }, function (err, res, body) {
        if (err) return cb(err);
        else if (res.statusCode !== 200) {
            console.log('Error fetching JSON: Cinema site responded with code: ' + res.statusCode);
            return cb(new Error());
        }
        return cb(undefined, body);
    });
};

// Update the rendered html with either fresh data or no-data and call itself
var updateRenderedHtml = function () {
    getMoviesData(function(err, body) {
        if (err) {
            console.log('Error fetching movies', err);
            handleDataError();
        }
        else {
            var data = {};
            try { data = processMoviesJson(JSON.parse(body)); }
            catch (err) {
                console.log('Failed to process data', err);
                handleDataError();
                return;
            }
            jade.renderFile('./views/index.jade', data, function (err, html) {
                if (err) {
                    console.log('Failed to render index', err);
                    handleDataError();
                }
                else renderedHtml = html;
            });

            lastUpdate = new Date();
            console.log('Updated html with fresh data', lastUpdate);

            setTimeout(updateRenderedHtml, 30*60*1000);
        }
    });
}.call();

var handleDataError = function () {
    if (lastUpdate.toDateString() !== new Date().toDateString()) {
        jade.renderFile('./views/no-data.jade', function (err, html) {
            if (err) console.log('Error rendering no-data jade', err);
            else renderedHtml = html;
        });
    }
    setTimeout(updateRenderedHtml, 60*1000);
};


/**
 * Start server:
 */

app.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(renderedHtml);
});


var port = (app.get('env') === 'production') ? 8000 : 8001;
app.listen(port);
console.log('Running server in ' + app.get('env') + ' envitonment at port ' + port);
