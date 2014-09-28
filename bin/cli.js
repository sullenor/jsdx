#!/usr/bin/env node
'use strict';

var program = require('commander');
var pkg = require('../package');

program
    .version(pkg.version)
    .option('--config <path>', 'Specify the path to the config file')
    .option('-c, --coverage', 'Calculates the coverage of the blocks')
    .option('-d, --destination <path>', 'Specify the path to the report')
    .option('-h, --html', 'Creates a report on the result')
    // .option('-s, --silent')
    // .option('-r, --reporter', 'Formats the output')
    .parse(process.argv);

var logger = require('../lib/logger');
var path = require('path');
var Promise = require('vow').Promise;

var promise = Promise.cast(loadConfig())
    .then(extendConfig)
    .then(jsdx);

if (program.coverage) {
    promise = promise.then(getCoverage);
}

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

/**
 * Расширяет конфиг.
 *
 * @param  {object} config
 * @return {object}
 */
function extendConfig(config) {
    config.levels = program.args || config.levels || [];
    config.output = program.destination || config.output;

    return config;
}

/**
 * Обходит уровни, формирует синтаксическое дерево.
 *
 * @param  {object}  config
 * @return {promise}
 */
function jsdx(config) {
    return require('../index')(config.levels, config);
}

/**
 * Формирует отчет по покрытию кода документацией.
 *
 * @param  {object} ast
 * @return {object}
 */
function getCoverage(ast) {
    return require('../lib/coverage')(ast);
}