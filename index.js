/*
    Required Modules
 */

var
    cheerio = require('cheerio'),
    request = require('request'),
    microdata = require('microdata-node'),
    microformat = require('microformat-node'),
    ogs = require('./lib/ogs'),
    _ = require('lodash'),
    J = require('JSONSelect');

var populate = {
    meta: {},
    microdata: {},
    microformat: {},
    headers: {
        h1:[],
        h2:[],
        h3:[],
        h4:[],
        h5:[]
    },
    images: [],
    og: {}
};

var simpleSet = {};


var loadDocument = function (url, callback) {


    request(url, function (err, res, body) {

        if (err) {
            callback(err, null);
        } else if (body) {
            callback(null, body, cheerio.load(body));

        } else if (res) {
            callback(err, null);
        }

    });

};



var parse = function(url, callback, opts) {





    loadDocument(url, function(err, body, $) {

        if (err) {
            callback(err, null);
        } else if ($) {

            var $head = $('head'),
                $body = $('body');

            if (opts.meta) {
                populate.meta.title = $head.find('title').text();
                populate.meta.description = $head.find('description').text();
                populate.meta.keywords = $head.find('keywords').text().split(',');
            }

            if (opts.headers) {


                $body.find('h1').each(function(i, el) {

                    populate.headers.h1.push($(el).text().trim());

                });

                $body.find('h2').each(function(i, el) {

                    populate.headers.h2.push($(el).text().trim());

                });

                $body.find('h3').each(function(i, el) {

                    populate.headers.h3.push($(el).text().trim());

                });

                $body.find('h4').each(function(i, el) {

                    populate.headers.h4.push($(el).text().trim());

                });

                $body.find('h5').each(function(i, el) {

                    populate.headers.h5.push($(el).text().trim());

                });
            }

            if (opts.images) {
                $body.find('img').each(function(i, el) {

                    populate.images.push($(el).attr('src'));

                });
            }


            if (opts.microdata) {
                populate.microdata = microdata.toJson(body);
            }


            if (opts.microformats) {
                microformat.parseHtml(body, {}, function (err, data) {
                    if (err) {
                        callback(err);
                    } else {

                        populate.microformat = data;

                        if (opts.og) {
                            ogs.getOG(body, function(err, data) {
                                if (err) {
                                    callback(err);
                                } else {
                                    populate.og = JSON.parse(JSON.stringify(data));
                                    callback(null, JSON.parse(JSON.stringify(populate, null, 2)), body);
                                }
                            });
                        } else {
                            callback(null, JSON.parse(JSON.stringify(populate, null, 2)), body);
                        }
                    }
                });
            } else if (opts.og) {
                ogs.getOG(body, function(err, data) {
                    if (err) {
                        callback (err);
                    } else {
                        populate.og = JSON.parse(JSON.stringify(data));
                        callback(null, JSON.parse(JSON.stringify(populate, null, 2)), body);
                    }
                });
            }
        }
    });
};



module.exports = function (url, callback, options) {


    var defaults = {

        meta: true,
        microdata: true,
        microformats: true,
        headers: true,
        images: true,
        og: true,
        simplifyJSON: true

    };

    var opts = _.extend(defaults, options);

    parse(url, function (err, data, body) {


        if (opts.simplifyJSON) {
            /**
             * h-adr, h-card, h-entry, h-event, h-geo, h-news, h-product, h-recipe, h-resume, h-review-aggregate,
             * h-review, adr, hCard, hEntry, hEvent, geo, hNews hProduct, hRecipe, hResume, hReview-aggregate,
             * hReview, rel=tag, rel=licence, rel=no-follow, rel=author and XFN
             */

        }


        callback(err, data, body);
    }, opts);


};
