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

gulp.task('build', [ 'html', 'css', 'js', 'static']);
gulp.task('default', ['build']);
gulp.task('develop', gulpSequence('build', ['html-watch','css-watch', 'js-watch', 'static-watch', 'server']));
