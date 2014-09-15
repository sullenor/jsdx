#!/usr/bin/env node
'use strict';

var program = require('commander');
var pkg = require('../package.json');

program
    .version(pkg.version)
    .option('--config <path>', 'Specify path to the config file.')
    .option('-c, --coverage-only', 'Puts only the coverage report to the stdout.')
    .option('-d, --destination <path>', 'Specify destination path for the html page. Works with --html.')
    .option('-h, --html', 'Builds html page with report.')
    .option('-r, --reporter', 'Formats the output.')
    .parse(process.argv);

var path = require('path');
var configPath = program.config ? path.resolve(program.config) : path.resolve(process.cwd(), './jsdx');
var config;

try {
    config = require(configPath);
} catch (e) {
    config = {};
}

if (program.args.length) {
    config.levels = program.args;
}

if (!Array.isArray(config.levels) || config.levels.length === 0) {
    throw new Error('Nothing to parse');
}

var _ = require('lodash');
var jsdx = require('../index.js');
var util = require('util');
var utils = require('../lib/utils');

jsdx(config.levels)
    .then(function (ast) {
        ast = _.assign(ast, _.pick(config, ['description', 'name']));
        ast = _.defaults(ast, {description: '', name: 'Документация по проекту'});

        if (program.html) {
            return buildHtml(ast);
        }

        if (program.coverageOnly) {
            ast = ast.nodes.reduce(function (list, node) {
                list[node.name] = node.coverage;
                return list;
            }, {});
        }

        if (program.reporter) {
            console.log(util.inspect(ast));
        } else {
            console.log(JSON.stringify(ast, null, 4));
        }
    })
    .then(process.exit.bind(process, 0))
    .catch(function (err) {
        console.log(err.stack || err);
        process.exit(1);
    });

function buildHtml(ast) {
    var destPath = program.destination || config.output;

    if (typeof destPath === 'undefined') {
        throw new Error('I don\'t know where to put files.');
    }

    return utils.copy(path.resolve(__dirname, '../static'), destPath)
        .then(utils.write.bind(
            null,
            path.resolve(destPath, 'js', 'ast.js'),
            'function provide(){return ' + JSON.stringify(ast) + ';};'
        ));
};
