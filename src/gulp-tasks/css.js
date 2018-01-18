/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const plumber = require('gulp-plumber'),
        sass = require('gulp-sass'),
        postcss = require('gulp-postcss'),
        autoprefixer = require('autoprefixer'),
        nano = require('gulp-cssnano'),
        sourcemaps = require('gulp-sourcemaps');

    return function () {
        return gulp.src('client/css/*.scss')
            .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(postcss(
                [
                    autoprefixer({ browsers: ['last 2 versions', 'ie 9'] })
                ]
            ))
            .pipe(nano())
            .pipe(sourcemaps.write('./'))
            .pipe(plumber.stop())
            .pipe(gulp.dest('../dist/css'));
    };
};
