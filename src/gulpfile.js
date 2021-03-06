/*jslint node:true, esnext: true */
'use strict';

const path = require('path'),
      gulp = require('gulp'),
      gulpSequence = require('gulp-sequence'),
      tasksPath = path.join(__dirname, 'gulp-tasks');

// Load all gulp tasks, using the name of each file in the tasksPath as the name of the task.
require('fs').readdirSync(tasksPath).forEach(
    function (filename) {
        gulp.task(path.basename(filename, '.js'), require(path.join(tasksPath, filename))(gulp));
    }
);

gulp.task('build', gulp.series('html', 'css', 'js', 'static'));
gulp.task('build-prod', gulp.parallel(gulp.series('html', 'css', 'js', 'static'), 'inline'));
gulp.task('default', gulp.series('build'));
gulp.task('develop', gulp.series('build', gulp.parallel('html-watch','css-watch', 'js-watch', 'static-watch', 'server', 'browsersync')));
