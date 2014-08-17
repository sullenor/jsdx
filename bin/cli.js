#!/usr/bin/env node
'use strict';

var _ = require('lodash');
var jsdx = require('../jsdx');
var pkg = require('../package.json');
var program = require('commander');
var path = require('path');
var utils = require('../lib/utils');
var vow = require('vow');

// jsdx make <path>
// jsdx make --config <path>

program
    .version(pkg.version)
    .option('-C, --config <path>', 'specify config file')
    .parse(process.argv);

var configPath = path.resolve(program.config || 'jsdx.json');
var projectPath = path.resolve('package.json');

if (program.args[0] === 'make') {
    utils.fileExists(configPath, true)
        .then(function () {
            var config = require(configPath);
            return vow.all([jsdx(config.nodes), utils.fileExists(projectPath)])
                .then(utils.splat(function (ast, haspkg) {
                    var project = {description: '', name: 'Документация по проекту'};
                    if (haspkg) {
                        project = _.assign(project, _.pick(require(projectPath)));
                    }

                    return _.assign(ast, project);
                }));
        })
        .then(function (ast) {
            console.log(ast);
        })
        .catch(function (msg) {
            console.error(msg);
        });
}
