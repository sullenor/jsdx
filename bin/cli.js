'use strict';

var program = require('commander');
var pkg = require('../package.json');

program
    .version(pkg.version)
    .option('--config <path>', 'Specify path to the config file.')
    .option('--coverage-only', 'Puts only the coverage report to the stdout.')
    .option('--html', 'Builds html page with report.')
    .option('--reporter', 'Formats the output.')
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
    var err = Error();
    err.errno = 34;
    err.code = 'ENOENT';
    err.path = 'Nothing to parse';
    throw err;
}

var jsdx = require('../index.js');

jsdx(config.levels)
    .then(function (ast) {
        if (program.html) {
            return;
        }

        if (program.coverageOnly) {
            ast = ast.nodes.reduce(function (list, node) {
                list[node.name] = node.coverage;
                return list;
            }, {});
        }

        if (program.reporter) {} else {
            console.log(JSON.stringify(ast, null, 4));
        }
    })
    .catch(function (err) {
        console.log(err.stack || err);
    });
