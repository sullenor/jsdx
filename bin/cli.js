#!/usr/bin/env node
'use strict';

var pkg = require('../package.json');
var program = require('commander');

program
    .version(pkg.version)
    .option('-c, --config <path>', 'specify config file');

program
    .command('make')
    .description('builds documentation')
    .action(function () {
        var _ = require('lodash');
        var jsdx = require('../jsdx');
        var path = require('path');
        var utils = require('../lib/utils');
        var vow = require('vow');

        var configPath = path.resolve(program.config || 'jsdx.json');
        var projectPath = path.resolve('package.json');

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
                console.log(JSON.stringify(ast, null, 4));
                process.exit(0);
            })
            .catch(function (msg) {
                console.error(msg.stack || msg);
                process.exit(1);
            });
    });

program
    .command('*')
    .description('shows help')
    .action(function () {
        program.outputHelp();
    });

program.parse(process.argv);

if (program.args.length === 0) {
    program.outputHelp();
}
