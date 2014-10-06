#!/usr/bin/env node
'use strict';

var program = require('commander');
var pkg = require('../package');

program
    .version(pkg.version)
    .option('--config <path>', 'Specify the path to the config file')
    .option('-c, --coverage', 'Calculates the coverage of the blocks')
    .option('-o, --coverage-only', 'Leaves only the coverage report')
    .option('-d, --destination <path>', 'Specify the path to the report')
    .option('-h, --html', 'Creates a report on the result')
    // .option('-s, --silent')
    // .option('-r, --reporter', 'Formats the output')
    .parse(process.argv);

var logger = require('../lib/logger');
var path = require('path');
var Promise = require('vow').Promise;

var splat = require('../lib/utils').splat;

// Противный хак!
var config;

var promise = Promise.cast(loadConfig())
    .then(extendConfig)
    .then(jsdx);

if (program.coverage) {
    promise = promise.then(splat(getCoverage));
}

if (program.html) {
    promise = promise.then(splat(buildHtml));
} else {
    if (program.coverageOnly) {
        promise = promise.then(splat(leaveOnlyCoverage));
    }

    promise = promise
        .then(splat(logger.write));
}

promise
    .catch(logger.error);

/**
 * Подгружает конфиг.
 *
 * @return {object}
 */
function loadConfig() {
    var configName = '.jsdx';
    var configPath = path.resolve(program.config || process.cwd(), configName);
    // var config;

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
    config.source = path.resolve(__dirname, '../static', '*');

    if (config.output) {
        config.output = path.resolve(config.output);
    }

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

function buildHtml(ast) {
    return require('../lib/html')(ast, config);
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

/**
 * Оставляет только отчет по покрытию.
 *
 * @return {object}
 */
function leaveOnlyCoverage(ast) {
    return require('../lib/coverage-only')(ast);
}