/*jslint node:true, nomen:true, esnext: true */
'use strict';

const SupplierProduct = require('../../../../models/supplier-product'),
    crudRoutes = require('../../../../lib/crud'),
    textSearchFields = ['product', 'supplier'];

module.exports = function (router) {
    crudRoutes(router, SupplierProduct, textSearchFields);
};
