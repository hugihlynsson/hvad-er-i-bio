const fs = require('fs');
const sanitize = require('sanitize-filename');
const request = require('request');

// Returns a relative url to the cached
module.exports = function cachePoster(url, title) {
  const fileName = `${sanitize(title)}.${url.split('.').pop()}`;

  // Todo: Invalidate the cache if too old
  if (!fs.existsSync(`{./public/posters/${fileName}`)) {
    request(url).pipe(fs.createWriteStream(`./public/posters/${fileName}`));
  }

  return `posters/${encodeURIComponent(fileName).replace(/[!'()]/g, '').replace(/\*/g, '%2A')}`;
};
