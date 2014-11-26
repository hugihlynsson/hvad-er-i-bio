'use strict';

var express = require('express');
var request = require('request');
var jade = require('jade');
var cachePoster = require('./cachePoster');

var app = express();
app.use(express.static(__dirname + '/public'));



/**
 * Functions for app:
 */

// The prerendered jade file:
var renderedHtml = '';
// Initialize with loading view:
jade.renderFile('./views/loading.jade', function (err, html) {
    if (err) console.log(err);
    else renderedHtml = html;
});


// Initialize update to the beginning of Unix...
var lastUpdate = new Date(0);


// Fetch the movies data from apis.is and do some error checking:
var getMoviesData = function (cb) {
    request.get('http://apis.is/cinema', function (err, res, body) {
        if (err) return cb(err);
        else if (res.statusCode !== 200) {
            console.log('Error fetching JSON: Cinema site responded with code: ' + res.statusCode);
            return cb(err);
        }
        return cb(undefined, body);
    });
};


var updateRenderedHtml = function () {
    getMoviesData(function(err, body) {
        if (err) {
            console.log('Error fetching movies', err);
            if (lastUpdate.toDateString() !== new Date().toDateString()) {
                jade.renderFile('./views/no-data.jade', function (err, html) {
                  if (err) console.log('Error rendering no-data jade', err);
                  else renderedHtml = html;
                });
            }
            setTimeout(updateRenderedHtml, 60*1000);
        }
        else {
            var data = processMovieJson(JSON.parse(body).results);
            jade.renderFile('./views/index.jade', data, function (err, html) {
                if (err) console.log('Failed to render index', err);
                else {
                    renderedHtml = html;
                }
            });

            lastUpdate = new Date();
            console.log(lastUpdate);
            console.log('Updated html with fresh data');

            setTimeout(updateRenderedHtml, 30*60*1000);
        }
    });
}.call();


// Recreate the global movies data based on fresh info:
var processMovieJson = function (moviesJSON) {
    // Helpers:
    var timeToNum = function (time) {
        var parts = time.split(':');
        return parts[0] + (parseInt(parts[1], 10)/60 + '').substring(1);
    };
    var numToTime = function (number) {
        var parts = number.split('.');
        if (parts.length === 1 || parseInt(parts[1], 10) === 0) return number + ':00';
        var minutes = Math.round(parseFloat('0.' + parts[1])*60).toString();
        if (minutes.length === 1) minutes = '0' + minutes;
        return parts[0] + ':' + minutes;
    };
    var knownCapitalPlaces = [
        'Bíó Paradís',
        'Háskólabíó',
        'Laugarásbíó',
        'Sambíóin Álfabakka',
        'Sambíóin Egilshöll',
        'Sambíóin Kringlunni',
        'Smárabíó'
    ];
    var months = [
        'janúar',
        'febrúar',
        'mars',
        'apríl',
        'maí',
        'júní',
        'júlí',
        'ágúst',
        'september',
        'október',
        'nóvember',
        'desember'
    ];

    // Start constructing the two data sets, one for jade and the other
    // for Javascript functionality:
    var jadeData = {};
    jadeData.titles = [];
    jadeData.capitalPlaces = [];
    jadeData.ruralPlaces = [];
    lastUpdate = new Date();
    jadeData.date = lastUpdate.getDate() + '. ' + months[lastUpdate.getMonth()];

    var data = {};
    data.titles = {};
    data.hasMovies = true;

    var lowestShowtime = 24;
    var highestShowtime = 0;

    // Cycle through the whole json to work with the data:
    moviesJSON.forEach(function (movie) {

        var jadeMovie = {};
        jadeMovie.title = movie.title;
        jadeMovie.rating = movie.imdb.split('/')[0];
        jadeMovie.votes = movie.imdb.split(' ')[2];
        jadeMovie.imdbUrl = movie.imdbLink;
        jadeMovie.restriction = movie.restricted;

        jadeMovie.poster = cachePoster(movie.image, movie.title);

        jadeMovie.shows = [];

        data.titles[movie.title] = {};

        var currentMovie = data.titles[movie.title];
        currentMovie.isFiltered = false;
        currentMovie.rating = movie.imdb.split('/')[0];
        currentMovie.places = {};

        // Cylce through the shows:
        movie.showtimes.forEach(function (place) {
            var jadeShow = {};
            jadeShow.theater = place.theater;
            jadeShow.times = [];

            // If not yet there, add place to jadeData places:
            if (knownCapitalPlaces.indexOf(place.theater) >= 0) {
                if (jadeData.capitalPlaces.indexOf(place.theater) < 0)
                    jadeData.capitalPlaces.push(place.theater);
            }
            else {
                if (jadeData.ruralPlaces.indexOf(place.theater) < 0)
                    jadeData.ruralPlaces.push(place.theater);
            }

            currentMovie.places[place.theater] = {};
            currentMovie.places[place.theater].times = {};
            currentMovie.places[place.theater].isFiltered = false;

            // Cycle through the shows times:
            place.schedule.forEach(function (time) {
                var timeNumber = timeToNum(time);

                jadeShow.times.push({human: time, number: timeNumber});

                // Check if new limit has been found
                if (timeNumber < lowestShowtime) lowestShowtime = timeNumber;
                if (timeNumber > highestShowtime) highestShowtime = timeNumber;

                currentMovie.places[place.theater].times[timeNumber] = 'visible';
            });
            jadeMovie.shows.push(jadeShow);
        });
        jadeData.titles.push(jadeMovie);
    });

    // Make the places fit well into the filter box in 1024+ view
    jadeData.capitalPlaces.sort();

    // Round to nearest quarter and convert to human readable time
    var roundedLow = (Math.floor(parseFloat(lowestShowtime)*4)/4) + '';
    var roundedHigh = (Math.ceil(parseFloat(highestShowtime)*4)/4) + '';
    jadeData.lowestShowtime = { human: numToTime(roundedLow), number: roundedLow };
    jadeData.highestShowtime = { human: numToTime(roundedHigh), number: roundedHigh };

    return { movies: jadeData, data: data };
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
