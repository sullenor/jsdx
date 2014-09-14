'use strict';

var _ = require('lodash');
var error = require('./error');
var path = require('path');
var vow = require('vow');
var vowFs = require('vow-fs');
var undef;

/**
 * @param  {string}   pathName
 * @param  {function} [fn]
 * @param  {boolean}  [err]
 * @return {promise}
 */
exports.fileExists = function (pathName, fn, err) {
    if (typeof fn === 'boolean') {
        err = fn;
        fn = undef;
    }

    return vowFs.exists(pathName)
        .then(function (exists) {
            if (!exists) {
                err && error('Whut? I can\'t find that! ' + pathName);
                return false;
            }

            return vowFs.isFile(pathName)
                .then(function (isfile) {
                    if (!isfile) {
                        err && error('Whut? It\'s a directory? ' + pathName);
                        return false;
                    }

                    typeof fn === 'function' && fn(pathName);
                    return true;
                });
        });
};

/**
 * @param  {object}          [options]
 * @return {(array|promise)}
 */
exports.filterFiles = function (options) {
    options = options || {};
    return function (files) {
        if (options.mask) {
            files = files.filter(function (file) {
                return options.mask.test(file);
            });
        }

        if (options.type) {
            var method;
            options.type === 'dir' && (method = vowFs.isDir);
            options.type === 'file' && (method = vowFs.isFile);
            if (method) {
                return vow.all(files.map(exports.first(method, vowFs)))
                    .then(function (flags) {
                        return files.filter(function (file, i) {
                            return flags[i];
                        });
                    });
            }
        }

        return files;
    };
};

/**
 * @param  {function} fn
 * @param  {object}   ctx
 * @return {function}
 */
exports.first = function (fn, ctx) {
    return function (a) {
        return fn.call(ctx, a);
    };
};

/**
 * @param  {string}  pathName
 * @return {promise}
 */
exports.listDir = function (pathName) {
    return vowFs.listDir(pathName)
        .then(function (files) {
            return files.map(exports.first(_.partial(path.resolve, pathName)));
        });
};

exports.readFile = function (pathName) {
    return vowFs.read(pathName, {encoding: 'utf8'});
};

exports.splat = function (fn, ctx) {
    return function (arr) {
        return fn.apply(ctx, arr);
    };
};
