const fs = require('fs');
const cachePoster = require('./cachePoster');


// Helpers:
function timeToNum(time) {
  const parts = time.split(':');
  return `${parts[0]}${(parseInt(parts[1], 10) / 60).toString().substring(1)}`;
}

function numToTime(number) {
  const parts = number.split('.');
  if (parts.length === 1 || parseInt(parts[1], 10) === 0) {
    return `${number}:00`;
  }
  let minutes = Math.round(parseFloat(`0.${parts[1]}`) * 60).toString();
  if (minutes.length === 1) {
    minutes = `0${minutes}`;
  }
  return `${parts[0]}:${minutes}`;
}


const knownCapitalPlaces = [
  'Bíó Paradís',
  'Háskólabíó',
  'Laugarásbíó',
  'Álfabakki',
  'Sambíóin Egilshöll',
  'Kringlubíó',
  'Smárabíó',
];

const months = [
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
  'desember',
];


const theaterData = JSON.parse(fs.readFileSync('./data/theaterList.json'));
const theaterNameMap = {};
theaterData.forEach((theater) => { theaterNameMap[theater.id] = theater.name; });

// Recreate the global movies data based on fresh info:
function processMoviesJson(moviesJSON) {
  // Start constructing the two data sets, one for jade and the other
  // for Javascript functionality:
  const jadeData = {};
  jadeData.titles = [];
  jadeData.capitalPlaces = [];
  jadeData.ruralPlaces = [];
  jadeData.date = `${new Date().getDate()}.${months[new Date().getMonth()]}`;

  const data = {};
  data.titles = {};
  data.hasMovies = true;

  let lowestShowtime = 24;
  let highestShowtime = 0;

  // Cycle through the whole json to work with the data:
  moviesJSON.forEach((movie) => {
    const jadeMovie = {};
    jadeMovie.title = movie.title;
    jadeMovie.rating = movie.ratings.imdb;
    jadeMovie.imdbUrl = `http://www.imdb.com/title/tt${movie.ids.imdb}`;
    jadeMovie.restriction = movie.certificateIS;

    jadeMovie.poster = cachePoster(movie.poster, movie.title);

    jadeMovie.shows = [];

    data.titles[movie.title] = {};

    const currentMovie = data.titles[movie.title];
    currentMovie.isFiltered = false;
    currentMovie.rating = movie.ratings.imdb;
    currentMovie.places = {};

    // Cylce through the shows:
    movie.showtimes.filter((place) => theaterNameMap[place.cinema]).forEach((place) => {
      const jadeShow = {};
      const theaterName = theaterNameMap[place.cinema];
      jadeShow.theater = theaterName;
      jadeShow.times = [];

      // If not yet there, add place to jadeData places:
      if (knownCapitalPlaces.indexOf(theaterName) >= 0) {
        if (jadeData.capitalPlaces.indexOf(theaterName) < 0) {
          jadeData.capitalPlaces.push(theaterName);
        }
      } else {
        if (jadeData.ruralPlaces.indexOf(theaterName) < 0) {
          jadeData.ruralPlaces.push(theaterName);
        }
      }

      currentMovie.places[theaterName] = {};
      currentMovie.places[theaterName].times = {};
      currentMovie.places[theaterName].isFiltered = false;

      // Cycle through the shows times:
      place.schedule.forEach((time) => {
        const timeNumber = timeToNum(time);

        jadeShow.times.push({ human: time, number: timeNumber });

        // Check if new limit has been found
        if (timeNumber < lowestShowtime) {
          lowestShowtime = timeNumber;
        }
        if (timeNumber > highestShowtime) {
          highestShowtime = timeNumber;
        }

        currentMovie.places[theaterName].times[timeNumber] = 'visible';
      });
      jadeMovie.shows.push(jadeShow);
    });

    if (!Object.keys(currentMovie.places).length) {
      delete data.titles[movie.title];
    }

    if (jadeMovie.shows.length) {
      jadeData.titles.push(jadeMovie);
    }
  });

  // Make the places fit well into the filter box in 1024+ view
  jadeData.capitalPlaces.sort();

  // Round to nearest quarter and convert to human readable time
  const roundedLow = (Math.floor(parseFloat(lowestShowtime) * 4) / 4).toString();
  const roundedHigh = (Math.ceil(parseFloat(highestShowtime) * 4) / 4).toString();
  jadeData.lowestShowtime = { human: numToTime(roundedLow), number: roundedLow };
  jadeData.highestShowtime = { human: numToTime(roundedHigh), number: roundedHigh };

  return { movies: jadeData, data };
}

module.exports = processMoviesJson;
