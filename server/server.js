const express = require('express');
const jade = require('jade');

const moviesFetcher = require('./moviesFetcher');


// Wrap jade.renderFile in a promise
function renderJadeFile(path, data) {
  return new Promise((resolve, reject) => {
    jade.renderFile(path, data, (err, html) => {
      if (err) {
        return reject(new Error(err));
      }
      return resolve(html);
    });
  });
}


let moviesData = {};

// The html to be serverd from memory
let renderedHtml;

// Initialize update to the beginning of Unix
let lastUpdate = new Date(0);


function replaceHtml(html) { renderedHtml = html; }
function setUpdateDate() { lastUpdate = new Date(); }


// Start rendering the loading view
renderJadeFile('./views/loading.jade').then(replaceHtml).catch(console.log);

moviesFetcher((data, err) => {
  if (err) {
    console.log(err.stack);
    if (lastUpdate.toDateString() !== new Date().toDateString()) {
      // Last data is from yesterday
      renderJadeFile('./views/no-data.jade').then(replaceHtml).catch(console.log);
    }
  }
  moviesData = data;
  renderJadeFile('./views/index.jade', data)
    .then(replaceHtml)
    .then(setUpdateDate)
    .then(() => console.log('Updated html with fresh data'))
    .catch(console.log);
});

const app = express();
app.use(express.static(`${__dirname}/../public`));


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
  res.json(moviesData);
});

const productionPort = process.env.PORT || 8000;

const port = (app.get('env') === 'production') ? productionPort : 8001;
app.listen(port, () => {
  console.log(`Running server in ${app.get('env')} envitonment at port ${port}`);
});
