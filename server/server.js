const fs = require('fs');
const express = require('express');
const request = require('request');
const jade = require('jade');
const Promise = require('bluebird');

const processMoviesJson = require('./processMoviesJson');


const app = express();
app.use(express.static(`${__dirname}/../public`));


// Wrap jade.renderFile in a promise
function renderJadeFile(path, data) {
  return new Promise((resolve, reject) => {
    jade.renderFile(path, data, (err, html) => {
      if (err) {
        reject(new Error(err));
      }
      resolve(html);
    });
  });
}

let processedData;


// The html to be serverd from memory
let renderedHtml;


// Initialize update to the beginning of Unix
let lastUpdate = new Date(0);


// A function to update the renderedHtml to make Promise.then() nicer
function replaceHtml(html) { renderedHtml = html; }

// Start rendering the loading view
renderJadeFile('./views/loading.jade').then(replaceHtml).catch(console.log);

// Returns movie data. Demo data is returned if KVIKMYNDIR_KEY isn't set
function fetchData() {
  const kvikmyndirKey = process.env.KVIKMYNDIR_KEY;
  if (!kvikmyndirKey && app.get('env') !== 'production') {
    console.log('The kvikmyndir.is api key was not found, using demo data');
    return new Promise((resolve, reject) => {
      fs.readFile('./data/demoData.json', (err, data) => {
        if (err) {
          reject(new Error(err));
        } else {
          resolve(data);
        }
      });
    });
  }
  return new Promise((resolve, reject) => {
    const url = `http://kvikmyndir.is/api/showtimes/?key=${kvikmyndirKey}`;
    request.get({ url }, (err, res, body) => {
      if (err) {
        reject(new Error(err));
      } else if (res.statusCode !== 200) {
        reject(new Error(`Faild to fetch data, got bad status: ${res.statusCode}`));
      } else {
        resolve(body);
      }
    });
  });
}


// Update the rendered html with either fresh data or no-data and call itself
function updateData() {
  fetchData()
    .then(JSON.parse)
    .then(processMoviesJson)
    .then((data) => {
      processedData = data;
      return renderJadeFile('./views/index.jade', data);
    })
    .then(replaceHtml)
    .then(() => {
      lastUpdate = new Date();
      console.log('Updated html with fresh data', lastUpdate);
      setTimeout(updateData, 30 * 60 * 1000);
    })
    .catch((err) => {
      console.log(err.stack);
      if (lastUpdate.toDateString() !== new Date().toDateString()) {
        renderJadeFile('./views/no-data.jade').then(replaceHtml).catch(console.log);
      }
      setTimeout(updateData, 60 * 1000);
    });
}
updateData();


/**
 * Start server:
 */

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(renderedHtml);
});

app.get('/debug', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`Last successful fetch: ${lastUpdate}`);
});

app.get('/movies', (req, res) => {
  res.json(processedData && { movies: processedData.movies && processedData.movies.titles });
});

const port = (app.get('env') === 'production') ? 8000 : 8001;

app.listen(port);

console.log(`Running server in ${app.get('env')} envitonment at port ${port}`);
