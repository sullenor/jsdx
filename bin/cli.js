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
    .option('-s, --silent')
    .option('-r, --reporter', 'Formats the output')
    .parse(process.argv);

var _ = require('lodash');
var log = require('../lib/log');
var path = require('path');
var Promise = require('vow').Promise;

var promise = loadConfig()
    .then(extendConfig)
    .then(check)
    .then(jsdx);

if (program.coverage) {
    promise = promise.then(coverage);
}

if (program.reporter) {
    promise = promise.then(format);
}

promise
    .then(log.write)
    .catch(log.error);

/**
 * Подгружает пользовательский файлик с настройками.
 *
 * @param  {string}  configPath Абсолютный путь
 * @return {promise}
 */
function loadConfig() {
    var configName = 'jsdx';
    var configPath = path.resolve(program.config || process.cwd(), configName);
    var config;

    try {
        config = require(configPath);
    } catch(e) {
        config = {};
    }

    return new Promise(function (resolve, reject) {
        if (!_.isPlainObject(config)) {
            return reject('Invalid config file');
        }

        resolve(config);
    });
}

/**
 * Расширяет настройки за счет входных параметров.
 *
 * @param  {object} config
 * @return {object}
 */
function extendConfig(config) {
    config.levels = program.args || config.levels || [];

    if (program.destination) {
        config.output = program.destination;
    }

    return config;
}

/**
 * Предварительная проверка входных данных.
 *
 * @param  {object}  config
 * @return {promise}
 */
function check(config) {
    return new Promise(function (resolve, reject) {
        if (config.levels.length === 0) {
            return reject('Nothing to parse');
        }

        if (program.html && !config.output) {
            return reject('I don\t where to put the report');
        }

        resolve(config);
    });
}

/**
 * Парсит уровни с блоками.
 *
 * @param  {object}  config
 * @return {promise}
 */
function jsdx(config) {
    return require('../index')(config.levels);
}

/**
 * Считает покрытие.
 *
 * @param  {object}  ast
 * @return {object}
 */
function coverage(ast) {
    return require('../lib/coverage')(ast);
}

/**
 * Форматирует выходные данные.
 *
 * @param  {object}  ast
 * @return {string}
 */
function format(ast) {
    return log.format(ast);
}
