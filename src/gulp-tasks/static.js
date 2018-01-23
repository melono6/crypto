/*jslint node:true, esnext: true*/
'use strict';

module.exports = function (gulp) {
    const merge = require('merge-stream');

    return function () {
        return merge(
            gulp.src('client/img/**/*').pipe(gulp.dest('../dist/img/')),
            gulp.src('client/css/lib/**/*').pipe(gulp.dest('../dist/css/')),
            gulp.src('client/assets/**/*').pipe(gulp.dest('../dist/assets/')),
            gulp.src('client/js/lib/**/*').pipe(gulp.dest('../dist/js/lib/')),
            gulp.src('client/manifest.json').pipe(gulp.dest('../dist/'))
        );
    };
};
