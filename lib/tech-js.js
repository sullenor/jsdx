'use strict';

var fs = require('./fs');
var parseAst = require('./parse-ast');
var parseJs = require('./parse-js');
var path = require('path');

var PROP = 'js';
var SUFFIX = '.js';

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

            return fs.read(file)
                .then(parseJs)
                .then(parseAst)
                .then(function (ast) {
                    if (ast) {
                        block[PROP] = ast;
                    }

                    return block;
                });
        });
};