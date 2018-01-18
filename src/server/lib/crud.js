/*jslint node:true, nomen:true, esnext: true */
'use strict';

module.exports = (router, Model, textSearchFields = []) => {

    router.get('/',
        (req, res) => {
            let filter = {},
                sort = {},
                reserved = ['sort', 'dir', 'textSearch'];

            Object.keys(req.query).forEach((key) => {
                if (key === 'sort') {
                    sort[req.query[key]] = req.query.dir || 1;
                } else if (key === 'textSearch') {
                    filter.$or = textSearchFields.map((field) => {
                        let textSearch = {};
                        textSearch[field] = {
                            $regex : req.query[key],
                            $options: 'i'
                        };
                        return textSearch;
                    });
                } else if (reserved.indexOf(key) < 0) {
                    filter[key] = req.query[key];
                }
            });

            Model
                .find(filter)
                .sort(sort)
                .lean(true)
                .exec()
                .then((data) => {
                    res.json(data);
                });
    });

    router.get('/:id',
        (req, res) => {
            Model
                .findOne({_id: req.params.id})
                .lean(true)
                .exec()
                .then((data) => {
                    res.json(data);
                });
        });

    router.post('/',
        (req, res) => {
            Model
                .create(req.body)
                .then((err, model) => {
                    if (err) {
                        res.json(err);
                    } else{
                        res.json(model);
                    }
                });
        });

    router.put('/:id',
        (req, res) => {
            Model
                .findOne({_id: req.params.id})
                .exec()
                .then(function(item) {
                    Object.keys(item._doc).forEach(function(key) {
                        if (req.body.hasOwnProperty(key)) {
                            item[key] = req.body[key];
                        }
                    });
                    return item;
                })
                .then(function(item) {
                    return item.save();
                })
                .then((item) => {
                    res.json(item);
                });
        });

    router.delete('/:id',
        (req, res) => {
            Model
                .findOne({_id: req.params.id})
                .exec()
                .then(function(item) {
                    return item.remove();
                })
                .then(() => {
                    res.json('done');
                });
        });
};
