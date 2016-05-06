const fs = require('fs');
const request = require('request');

const processMoviesJson = require('./processMoviesJson');


// Returns movie data. Demo data is returned if KVIKMYNDIR_KEY isn't set
function fetchData() {
  const kvikmyndirKey = process.env.KVIKMYNDIR_KEY;
  if (!kvikmyndirKey && process.env.ENV_VARIABLE !== 'production') {
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
module.exports = function moviesFetcher(onFinish) {
  fetchData()
    .then(JSON.parse)
    .then(processMoviesJson)
    .then(onFinish)
    .then(() => setTimeout(() => moviesFetcher(onFinish), 30 * 60 * 1000))
    .catch((err) => {
      onFinish(undefined, err);
      setTimeout(() => moviesFetcher(onFinish), 60 * 1000);
    });
};
