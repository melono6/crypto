/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const browserSync = require('browser-sync').create();

    return function () {
        browserSync.init({
            files: ['../dist/css/styles.css'],
            proxy: {
                target: "localhost:5000"
            },
            port: 8000
        });
    };
};
