#!/usr/bin/env node
'use strict';

var pkg = require('../package');
var program = require('commander');

program
    .version(pkg.version)
    .parse(process.argv);

var fs = require('../lib/fs');
var path = require('path');
var parseAst = require('../lib/parse-ast');
var parseJs = require('../lib/parse-js');
var Promise = require('vow').Promise;
var utils = require('../lib/utils');

Promise.all(program.args.map(parseArg))
    .then(function (covs) {
        var errors = 0;

        covs.forEach(function (cov, i) {
            if (cov !== null && cov !== 1) {
                errors++;
                console.error(path.basename(program.args[i]) + ': write jsdocs for that file, please');
            }
        });

        if (errors) {
            process.exit(2);
        }
    })
    .catch(function (err) {
        console.log(err);
        process.exit(2);
    });

function parseArg(arg) {
    return fs.read(arg)
        .then(parseFile);
}

function parseFile(string) {
    return Promise.cast(parseJs(string))
        .then(utils.splat(parseAst))
        .then(utils.splat(function (ast) {
            return ast ?
                getCoverage(ast) : null;
        }));
}

function getCoverage(ast) {
    var methods = [].concat(ast.blockMethods || [], ast.staticMethods || []);
    var covered = 0;
    var total = 0;

    methods.forEach(function (method) {
        method.comment && covered++;
        total++;
    });

    return Math.floor(covered / total);
}
