'use strict';

var _ = require('lodash');
var path = require('path');
var vow = require('vow');
var vowFs = require('vow-fs');

function attach(block, options) {
    options = options || {};
    return vow.all(_.map(options, function (ext, prop) {
        var pathName = path.resolve(block.path, ext.replace('?', block.name));
        return fileExist(pathName, function (pathName) {
            block[prop] = pathName;
        });
    }))
        .then(function () {
            return block;
        });
}

function build(pathName, type) {
    return {name: name(pathName, type), path: pathName, type: type};
}

function fileExist(pathName, fn) {
    return vowFs.exists(pathName)
        .then(function (exists) {
            if (!exists) {
                return false;
            }

            return vowFs.isFile(pathName)
                .then(function (isfile) {
                    if (!isfile) {
                        return false;
                    }

                    typeof fn === 'function' && fn(pathName);
                    return true;
                });
        });
}

function filter(options) {
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
                return vow.all(files.map(first(method, vowFs)))
                    .then(function (flags) {
                        return files.filter(function (file, i) {
                            return flags[i];
                        });
                    });
            }
        }

        return files;
    };
}

function first(fn, ctx) {
    return function (a) {
        return fn.call(ctx, a);
    };
}

function listDir(pathName) {
    return vowFs.listDir(pathName)
        .then(function (files) {
            return files.map(first(_.partial(path.resolve, pathName)));
        });
}

function map(fn) {
    return function (arr) {
        return vow.all(arr.map(fn));
    };
}

function name(pathName) {
    return String(pathName.match(/\/([a-z\-]+)$/i)[1]);
}

module.exports = function (pathName) {
    return listDir(pathName)
        .then(filter({mask: /\/[a-z\-]+$/i, type: 'dir'}))
        .then(map(first(_.partialRight(build, 'block'))))
        .then(map(first(_.partialRight(attach, {js: '?.js', md: '?.ru.md'}))));
};
