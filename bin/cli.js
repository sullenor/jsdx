#!/usr/bin/env node
'use strict';

var program = require('commander');
var pkg = require('../package');

program
    .version(pkg.version)
    .option('--config <path>', 'Specify the path to the config file')
    .option('-c, --coverage', 'Calculates the coverage of the blocks')
    // .option('-d, --destination <path>', 'Specify the path to the report')
    // .option('-h, --html', 'Creates a report on the result')
    // .option('-s, --silent')
    // .option('-r, --reporter', 'Formats the output')
    .parse(process.argv);

var logger = require('../lib/logger');
var path = require('path');
var Promise = require('vow').Promise;

var promise = Promise.cast(loadConfig())
    .then(extendConfig)
    .then(jsdx);

promise
    .then(logger.write)
    .catch(logger.error);

/**
 * Подгружает конфиг.
 *
 * @return {object}
 */
function loadConfig() {
    var configName = '.jsdx';
    var configPath = path.resolve(program.config || process.cwd(), configName);
    var config;

    try {
        config = require(configPath);
    } catch(e) {
        config = {};
    }

    return config;
}

function extendConfig(config) {
    config.levels = program.args || config.levels || [];

    return config;
}

function jsdx(config) {
    return require('../index')(config.levels, config);
}