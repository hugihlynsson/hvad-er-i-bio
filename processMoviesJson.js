'use strict';

var fs = require('fs');
var cachePoster = require('./cachePoster');


var theaterData = JSON.parse(fs.readFileSync('./data/theaterList.json'));
var theaterNameMap = {};
theaterData.forEach(function(theater) { theaterNameMap[theater.id] = theater.name; });

// Recreate the global movies data based on fresh info:
var processMoviesJson = function (moviesJSON) {
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
        'Álfabakki',
        'Sambíóin Egilshöll',
        'Kringlubíó',
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
    jadeData.date = new Date().getDate() + '. ' + months[new Date().getMonth()];

    var data = {};
    data.titles = {};
    data.hasMovies = true;

    var lowestShowtime = 24;
    var highestShowtime = 0;

    // Cycle through the whole json to work with the data:
    moviesJSON.forEach(function (movie) {

        var jadeMovie = {};
        jadeMovie.title = movie.title;
        jadeMovie.rating = movie.ratings.imdb;
        jadeMovie.imdbUrl = 'http://www.imdb.com/title/tt' + movie.ids.imdb;
        jadeMovie.restriction = movie.certificateIS;

        jadeMovie.poster = cachePoster(movie.poster, movie.title);

        jadeMovie.shows = [];

        data.titles[movie.title] = {};

        var currentMovie = data.titles[movie.title];
        currentMovie.isFiltered = false;
        currentMovie.rating = movie.ratings.imdb;
        currentMovie.places = {};

        // Cylce through the shows:
        movie.showtimes.forEach(function (place) {
            var jadeShow = {};
            var theaterName = theaterNameMap[place.cinema];
            jadeShow.theater = theaterName;
            jadeShow.times = [];

            // If not yet there, add place to jadeData places:
            if (knownCapitalPlaces.indexOf(theaterName) >= 0) {
                if (jadeData.capitalPlaces.indexOf(theaterName) < 0) {
                    jadeData.capitalPlaces.push(theaterName);
                }
            }
            else {
                if (jadeData.ruralPlaces.indexOf(theaterName) < 0) {
                    jadeData.ruralPlaces.push(theaterName);
                }
            }

            currentMovie.places[theaterName] = {};
            currentMovie.places[theaterName].times = {};
            currentMovie.places[theaterName].isFiltered = false;

            // Cycle through the shows times:
            place.schedule.forEach(function (time) {
                var timeNumber = timeToNum(time);

                jadeShow.times.push({human: time, number: timeNumber});

                // Check if new limit has been found
                if (timeNumber < lowestShowtime) lowestShowtime = timeNumber;
                if (timeNumber > highestShowtime) highestShowtime = timeNumber;

                currentMovie.places[theaterName].times[timeNumber] = 'visible';
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

module.exports = processMoviesJson;
