/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const watch = require('gulp-watch');

    return function () {
        return watch(['client/img/**/*', 'client/asset/**/*', 'client/js/lib/**/*'], function () {
            gulp.start('static');
        });
    };
};
