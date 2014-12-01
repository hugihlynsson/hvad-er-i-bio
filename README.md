# Hvað er í bíó?


## About

Hvað er í bíó? is a web-app that list all movie screenings in theaters in Iceland. The app is focused on providing an excellent user experience and solving the problem – finding a movie to see – in a efficient and intuitive manner. The data comes from the [Kvikmyndir.is](http://kvikmyndir.is) api.


## Development

Requirements:
- To run this project, you currently need an api key from Kvikmyndir.is set as the KVIKMYNDIR_KEY environment variable. The plan is to include a set of data for testing, omitting the need for the key
- [NodeJS](http://nodejs.org)

To start the server, run `node start`

The project uses [Gulp](http://gulpjs.com) to compile the files required for the front-end. That is:
-  JavaScript from the `source/scripts.js` to `public/main.js`
- Less from `source/styles.less` to `public/main.css`
Run `gulp` to start the compiling process. It will watch any changes and recompile the files.


## Todo

- Set up a testing environment and test all the things
- Break main.less into smaller, more maintainable files
- Use [browserify](http://browserify.org) for the front-end JS instead of manually adding files to the Gulp process
- Break scripts.js into smaller, more testable files
- Use Promises where it makes sense


## Copyright
© 2014 Hugi Hlynsson – all right reserved
