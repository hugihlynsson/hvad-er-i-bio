const fs = require('fs');
const request = require('request');

const processMoviesJson = require('./processMoviesJson');


// Get api.kvikmyndir.is token:
function getToken() {
  return new Promise((resolve, reject) => {
    const authOptions = {
      url: 'http://api.kvikmyndir.is/authenticate',
      body: {
        username: process.env.KVIKMYNDIR_USERNAME,
        password: process.env.KVIKMYNDIR_PASSWORD,
      },
      json: true,
    };
    request.post(authOptions, (error, response, json) => {
      if (error) {
        reject(new Error(error));
      } else {
        console.log('Got a fresh token');
        resolve(json.token);
      }
    });
  });
}


// Returns movie data. Demo data is returned if KVIKMYNDIR_KEY isn't set
function fetchData(token) {
  if (!token && process.env.ENV_VARIABLE !== 'production') {
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
    const url = `http://api.kvikmyndir.is/movies/?token=${token}`;
    request.get({ url, json: true }, (err, res, response) => {
      if (err) {
        reject(new Error(err));
      } else if (res.statusCode !== 200) {
        reject(new Error(`Faild to fetch data, got bad status: ${res.statusCode}`));
      } else {
        resolve(response);
      }
    });
  });
}


module.exports = function moviesFetcher(onFinish) {
  getToken()
    .then(fetchData)
    .then(processMoviesJson)
    .then(onFinish)
    .then(() => setTimeout(() => moviesFetcher(onFinish), 30 * 60 * 1000))
    .catch((err) => {
      onFinish(undefined, err);
      setTimeout(() => moviesFetcher(onFinish), 60 * 1000);
    });
};
