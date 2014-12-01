'use strict';

var express = require('express');
var request = require('request');
var jade = require('jade');
var Q = require('q');
var processMoviesJson = require('./processMoviesJson');

var app = express();
app.use(express.static(__dirname + '/public'));


// Wrap jade.renderFile in a promise
var renderJadeFile = function (path, data) {
    return Q.promise(function(resolve, reject) {
        jade.renderFile(path, data, function(err, html) {
            if (err) reject(new Error(err));
            resolve(html);
        });
    });
};


// A function to update the renderedHtml to make promise.then nicer.
var replaceHtml = function(html) { renderedHtml = html; };


// Initialize update to the beginning of Unix
var lastUpdate = new Date(0);

// The html to be serverd from memory
var renderedHtml;

// Start rendering the loading view
renderJadeFile('./views/loading.jade').then(replaceHtml).fail(console.log);


// Update the rendered html with either fresh data or no-data and call itself
var updateRenderedHtml = function () {
    Q.promise(function (resolve, reject) {
        var url = 'http://kvikmyndir.is/api/showtimes/?key=' + process.env.KVIKMYNDIR_KEY;
        request.get({ url: url }, function (err, res, body) {
            if (err) reject(new Error(err));
            else if (res.statusCode !== 200) {
                reject(new Error('Faild to fetch data, got bad status: ' + res.statusCode));
            }
            else resolve(body);
        });
    }).then(JSON.parse).then(processMoviesJson).then(function(data) {
        return renderJadeFile('./views/index.jade', data);
    }).then(replaceHtml).then(function() {
        lastUpdate = new Date();
        console.log('Updated html with fresh data', lastUpdate);
        setTimeout(updateRenderedHtml, 30*60*1000);
    }).fail(function (err) {
        console.log('Handling data error');
        console.log(err);
        if (lastUpdate.toDateString() !== new Date().toDateString()) {
            jade.renderFile('./views/no-data.jade', function (err, html) {
                if (err) console.log('Error rendering no-data jade', err);
                else renderedHtml = html;
            });
        }
        setTimeout(updateRenderedHtml, 60*1000);
    });
}();


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
