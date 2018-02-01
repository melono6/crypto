/*jslint node:true, esnext: true */
'use strict';

module.exports = function (gulp) {
    const plumber = require('gulp-plumber'),
        dust = require('dustjs-linkedin'),
        dustHtml = require('gulp-dust-html');

    dust.helpers = require('dustjs-helpers').helpers;
    require('dust-naming-convention-filters')(dust);
    dust.config.cache = false;

    return function () {
        return gulp.src(['client/html/**/*.dust', '!client/html/**/partials/**'])
            .pipe(dustHtml({
                basePath: 'client/html',
                data: function (file) {
                    try {
                        let path = file.path.slice(0, -5),
                            data;

                        if (require.cache[require.resolve(path)]) {
                            delete require.cache[require.resolve(path)];
                        }
                        console.log(path);
                        data = require(path);
                        
                        console.log(data);

                        return data;
                    } catch (ex) {
                        return { };
                    }
                }
            }))
            .pipe(plumber.stop())
            .pipe(gulp.dest('../dist/'));
    };
};
