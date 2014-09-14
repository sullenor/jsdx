'use strict';

var program = require('commander');
var pkg = require('../package.json');

program
    .version(pkg.version)
    .option('--config <path>', 'Specify path to the config file.')
    .option('-c, --coverage-only', 'Puts only the coverage report to the stdout.')
    .option('-h, --html', 'Builds html page with report.')
    .option('-r, --reporter', 'Formats the output.')
    .parse(process.argv);

var path = require('path');
var configPath = path.resolve(program.config || './jsdx');
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

var jsdx = require('../index.js');
var util = require('util');

jsdx(config.levels)
    .then(function (ast) {
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
    .catch(function (err) {
        console.log(err.stack || err);
    });

function buildHtml(ast) {
    var destPath = config.output;

    if (typeof destPath === 'undefined') {
        throw new Error('I don\'t know where to put files.');
    }

    destPath = path.resolve(destPath);
};
