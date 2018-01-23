/*jslint node:true, esnext:true */
'use strict';

module.exports = function (gulp) {
    const plumber = require('gulp-plumber'),
        sourcemaps = require('gulp-sourcemaps'),
        jslint = require('gulp-jslint'),
        merge = require('merge-stream'),
        //babel = require('gulp-babel'),
        uglify = require('gulp-uglify'),
        babelify = require('babelify'),
        browserMatrix = require('../package.json').browsers,
        browserify = require('browserify'),
        source = require('vinyl-source-stream'),
        buffer = require('vinyl-buffer');

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
                .transform("babelify", {presets: ["react", ["env", {"targets": {"browsers": browserMatrix}}]]})
                .bundle()
                .pipe(source('index.js'))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('../dist/js/'));
        
//        ,
//            
//            serviceWorker = browserify({
//                    entries: 'assets/js/serviceWorker.js', 
//                    debug: true
//                })
//                .transform("babelify", {presets: [["env", {"targets": {"browsers": browserMatrix}}]]})
//                .bundle()
//                .pipe(source('serviceWorker.js'))
//                .pipe(buffer())
//                .pipe(uglify())
//                .pipe(gulp.dest('../Brc.Web.dist/'));

        return merge( browserified);
    };
};
