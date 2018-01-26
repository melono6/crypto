/*jslint node:true, esnext:true */
'use strict';

module.exports = function (gulp) {
    const plumber = require('gulp-plumber'),
        sourcemaps = require('gulp-sourcemaps'),
        jslint = require('gulp-jslint'),
        merge = require('merge-stream'),
        uglify = require('gulp-uglify'),
        babelify = require('babelify'),
        browserify = require('browserify'),
        source = require('vinyl-source-stream'),
        buffer = require('vinyl-buffer'),
        browserSync = require('browser-sync');

    return function () {
        let 
//        jslinted =
//                gulp.src(['client/js/components/*.js', 'client/js/framework*.js'])
//                .pipe(jslint())
//                .pipe(plumber.stop())
//                .pipe(jslint.reporter('default')),
            
            browserified = browserify({
                    entries: 'client/js/index.js', 
                    debug: true
                })
                .transform("babelify", {presets: ["react", ["env", {"targets": {"browsers": ["last 2 versions"]}}]]})
                .bundle()
                .pipe(source('index.js'))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(uglify())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('../dist/js/'))
                .pipe(browserSync.stream()),
            
            serviceWorker = browserify({
                    entries: 'client/js/serviceWorker.js', 
                    debug: true
                })
                .transform("babelify", {presets: [["env", {"targets": {"browsers": ["last 2 versions"]}}]]})
                .bundle()
                .pipe(source('serviceWorker.js'))
                .pipe(buffer())
                .pipe(uglify())
                .pipe(gulp.dest('../dist/'));

        return merge(browserified, serviceWorker);
    };
};
