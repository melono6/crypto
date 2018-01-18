/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const watch = require('gulp-watch');

    return function () {
        return watch(['client/js/**/*.js', '!client/js/lib/**'], function () {
            gulp.start('js');
        });
    };
};
