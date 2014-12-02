# Hvað er í bíó?


## About

Hvað er í bíó? is a web app that displays movies screening the current day in Icelandic cinemas. The app is focused on providing a good user experience, solving the problem of finding a movie to see in an efficient and intuitive manner. The data comes from the [kvikmyndir.is](http://kvikmyndir.is) api.


## Development

Requirements:
- [NodeJS](http://nodejs.org)
- [Optional] An api key from kvikmyndir.is set as the `KVIKMYNDIR_KEY` environment variable. If it is not set and Node is not running in a production environment, data from `data/demoData.json` will be used.

To start the server, run `node server`. You can now navigate to http://localhost:8001 (or [8000](http://localhost:8000) in a production environment).

The project uses [Gulp](http://gulpjs.com) to compile the files required for the front-end. That is:
- Javascript from `source/scripts.js` to `public/main.js`
- Less from `source/styles.less` to `public/main.css`

Run `gulp` to start the compiling process. It will watch any changes and recompile the files. If you have [Livereload](http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions-) running in the browser, it will automatically update the site.


## Todo

- Set up a testing environment and test all the things
- Break main.less into smaller, more maintainable files
- Use [browserify](http://browserify.org) for the front-end JS instead of manually adding files to the Gulp process
- Break scripts.js into smaller, more testable files
