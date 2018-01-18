/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const watch = require('gulp-watch');

    return function () {
        return watch(['client/html/**/*.dust', 'client/html/**/*.json', 'client/html/**/*.js'], function () {
            gulp.start('html');
        });
    };
};
