/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const plumber = require('gulp-plumber'),
        sourcemaps = require('gulp-sourcemaps'),
        jslint = require('gulp-jslint'),
        browser = require('gulp-browser'),
        merge = require('merge-stream');

    return function () {
        let jslinted =
                gulp.src(['client/js/**/*.js', '!client/js/lib/**'])
                .pipe(jslint())
                .pipe(plumber.stop()),

            browserified = gulp.src(['client/js/*.js', '!client/js/serviceWorker.js'])
                .pipe(browser.browserify({transform: "reactify"}))
                .pipe(sourcemaps.init())
                .pipe(sourcemaps.write('./'))
                .pipe(plumber.stop())
                .pipe(gulp.dest('../dist/js/'));

        return merge(jslinted, browserified);
    };
};
