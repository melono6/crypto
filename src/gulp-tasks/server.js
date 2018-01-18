/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const nodemon = require('gulp-nodemon');

    return function () {
        return nodemon({
            script:  './server',
            ignoreRoot: ['.git'],
            ignore: [
                'client/',
            ],
        });
    };
};
