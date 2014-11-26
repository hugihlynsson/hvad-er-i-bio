'use strict';

var fs = require('fs');
var sanitize = require('sanitize-filename');
var request = require('request');

// Returns a relative url to the cached
var cachePoster = function(url, title) {
    var fileName = sanitize(title) + '.' + url.split('.').pop();

    // Todo: Invalidate the cache if too old
    if (!fs.existsSync('./public/posters/' + fileName)) {
        request(url).pipe(fs.createWriteStream('./public/posters/' + fileName));
    }

    return 'posters/' + encodeURIComponent(fileName).replace(/[!'()]/g, '').replace(/\*/g, '%2A');
};

module.exports = cachePoster;
