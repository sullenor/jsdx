'use strict';

var fs = require('./fs');
var parseAst = require('./parse-ast');
var parseJs = require('./parse-js');
var path = require('path');
var utils = require('./utils');

var splat = utils.splat;

/**
 * Поле, в которое будет сохранено полученное синтаксическое дерево.
 *
 * @type {string}
 */
var PROP = 'js';

/**
 * Суффикс файлов, содержащих js код.
 *
 * @type {string}
 */
var SUFFIX = '.js';

/**
 * Считывает содержимое файлика.
 *
 * @param  {string}  file
 * @param  {object}  block
 * @param  {object}  config
 * @return {promise}
 */
function readFile(file, block, config) {
    return fs.read(file)
        .then(function (string) {
            return [string, block, config];
        });
}

/**
 * Проверяет, есть ли у блока файлик *.js.
 * Если да, парсит его содержимое и сохраняет в поле js.
 *
 * @param  {object} block
 * @param  {string} block.name
 * @param  {string} block.path
 * @param  {object} config
 * @return {object}
 */
module.exports = function (block, config) {
    var file = path.join(block.path, block.name + SUFFIX);

    return fs.isfile(file)
        .then(function (exist) {
            if (!exist) {
                return block;
            }

            return readFile(file, block, config)
                .then(splat(parseJs))
                .then(splat(parseAst))
                .then(splat(function (ast) {
                    if (ast) {
                        block[PROP] = ast;
                    }

                    return block;
                }));
        });
};