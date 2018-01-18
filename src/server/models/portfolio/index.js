/*jslint node:true, nomen: true, esnext: true */
'use strict';

const mongoose = require('mongoose'),
    dbs = require('../../lib/mongoose-connections'),
    Schema = mongoose.Schema,
    schemaName = 'portfolio';

let Model,
    mongoSchema;


mongoSchema = new Schema(require('./portfolio-schema'));

mongoSchema.on('init', function (Model) {
    let initData;

    Model
        .findOne({})
        .lean(true)
        .exec(function (err, doc) {

            if (!doc) {
                initData = require('./init-data.json');
                initData.forEach(function (item) {
                    Model.create(item, function (err, doc) {
                        if (err) {
                            console.log('error on db init', err);
                        }
                        if (doc) {
                            console.log('db init. Created item on ' + schemaName);
                        }
                    });
                });
            }
        });
});

Model = dbs.main.model(schemaName, mongoSchema);
module.exports = Model;
