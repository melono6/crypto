/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const inlinesource = require('gulp-inline-source');

    return function () {
        return gulp.src('../dist/*.html')
            .pipe(inlinesource({compress:false}))
            .pipe(gulp.dest('../dist'));
    };
};
