#!/usr/bin/env node
'use strict';

var pkg = require('../package');
var program = require('commander');

program
    .version(pkg.version)
    .parse(process.argv);

var fs = require('../lib/fs');
var path = require('path');
var Promise = require('vow').Promise;

var parseJs = require('jsdx-js');

Promise.all(program.args.map(parseArg))
    .then(checkCoverage)
    .catch(function (err) {
        console.error(err.stack || err);
        process.exit(1);
    });

function parseArg(filePath) {
    return fs.read(filePath)
        .then(parseJs)
        .then(getCoverage);
}

function getCoverage(tree) {
    if (!tree) {
        return tree;
    }

    var methods = [].concat(tree.instance || [], tree.klass || []);
    var covered = 0;
    var total = 0;

    methods.forEach(function (method) {
        method.description && covered++;
        total++;
    });

    return Math.floor(covered / total);
}

function checkCoverage(reports) {
    var errors = 0;

    reports.forEach(function (report, i) {
        if (report !== null && report !== 1) {
            errors++;
            console.error(path.basename(program.args[i]) + ': write jsdocs for that file, please');
        }
    });

    process.exit(errors ? 2 : 0);
}
