'use strict';

var format = require('util').format;
var fs = require('./fs');
var path = require('path');
var Promise = require('vow').Promise;
var utils = require('./utils');

var splat = utils.splat;

/**
 * Шаблончик для получения названия модификатора.
 *
 * @type {RegExp}
 */
var modVal = /^([a-z\-]+_[a-z\-]+_)([a-z\-]+)(?:\.)/i;

/**
 * Поле, в которое будет записан путь к указанной технологии.
 *
 * @type {string}
 */
var PROP = 'md';

/**
 * Суффикс файлов, которые могут содержать дополнительную документацию.
 *
 * @type {string}
 */
var SUFFIX = '.ru.md';

/**
 * Проверяет наличие файлика с дополнительной информацией.
 * Если есть, то сохраняет его путь.
 *
 * @param  {object}  target
 * @param  {object}  token
 * @return {promise}
 */
function attachFile(target, token) {
    var file;

    if (typeof token === 'string') {
        file = token;
    } else {
        file = path.join(token.path, token.name + SUFFIX);
    }

    return fs.isfile(file)
        .then(function (exist) {
            if (exist) {
                target.md = file;
            }

            return token;
        });
}

/**
 * Формирует токен.
 *
 * @param  {string} file
 * @return {object}
 */
function build(file) {
    return {name: path.basename(file).replace(/^_+/, ''), path: file};
}

/**
 * Ищет и добавляет элементы и модификаторы в список.
 *
 * @param  {array}   stack Стэк с промисами.
 * @param  {object}  ast
 * @param  {object}  block
 * @return {promise}
 */
function processTop(stack, ast, block) {
    return fs.readdir(block.path)
        .then(fs.separate)
        .then(splat(function (dirs) {
            var elems = [];
            var mods = [];

            dirs.forEach(function (dir) {
                isElem(dir) && elems.push(build(dir));
                isMod(dir) && mods.push(build(dir));
            });

            if (elems.length) {
                ast.elems = elems;

                elems.forEach(function (elem) {
                    stack.push(attachFile(elem, {
                        name: resolve('elem', block, elem),
                        path: elem.path
                    }));
                });
            }

            if (mods.length) {
                ast.mods = mods;
            }

            return [stack, ast, block, elems, mods];
        }));
}

/**
 * Раскрывает элементы и модификаторы.
 * Упрощенная реализация.
 *
 * @todo   Допилить код для элементов.
 * @param  {array}   stack
 * @param  {object}  ast
 * @param  {object}  block
 * @param  {array}   elems
 * @param  {array}   mods
 * @return {promise}
 */
function processDescendants(stack, ast, block, elems, mods) {
    return Promise.all(mods.map(function (mod) {
        return processMods(stack, mod);
    }));
}

/**
 * Добавляет список значений для указанного модификатора.
 *
 * @param  {array}   stack
 * @param  {object}  mod
 * @return {promise}
 */
function processMods(stack, mod) {
    return fs.readdir(mod.path)
        .then(fs.separate)
        .then(splat(function (dirs, files) {
            var uniq = {};
            var vals = files.reduce(function (vals, file) {
                if (!modVal.exec(path.basename(file))) {
                    return vals;
                }

                var prefix = RegExp.$1;
                var name = RegExp.$2;

                if (uniq[name]) {
                    return vals;
                }

                var val = {name: name, path: mod.path};

                stack.push(attachFile(val, path.join(mod.path, prefix + name + SUFFIX)));
                vals.push(val);

                uniq[name] = true;

                return vals;
            }, []);

            if (vals.length) {
                mod.vals = vals;
            }
        }));
}

/**
 * Проверяет, является ли папка элементом.
 *
 * @param  {string}  dir
 * @return {boolean}
 */
function isElem(dir) {
    return /\/(?:__)?[a-z\-]+$/i.test(dir);
}

/**
 * Проверяет, является ли папка модификатором.
 *
 * @param  {string}  dir
 * @return {boolean}
 */
function isMod(dir) {
    return /\/_[a-z\-]+$/i.test(dir);
}

/**
 * Резолвит имя БЕМ сущности.
 *
 * @param  {string} type
 * @param  {object} block
 * @param  {object} elem
 * @param  {object} mod
 * @param  {object} val
 * @return {string}
 */
function resolve(type, block, elem, mod, val) {
    switch (type) {
    case 'block':
        return block.name;
    case 'mod':
        return format('%s_%s', block.name, mod.name);
    case 'elem':
        return format('%s__%s', block.name, elem.name);
    case 'elemmod':
        return format('%s__%s_%s_%s', block.name, elem.name, mod.name, val.name);
    }
}

/**
 * Формирует структуру блока и подтягивает файлики с документацией.
 *
 * @param  {object}  block
 * @param  {string}  block.name
 * @param  {string}  block.path
 * @param  {object}  config
 * @return {promise}
 */
module.exports = function (block, config) {
    var ast = {};
    var stack = [];

    stack.push(attachFile(ast, block));
    stack.push(processTop(stack, ast, block)
        .then(splat(processDescendants)));

    return Promise.all(stack)
        .then(function () {
            if (Object.keys(ast).length) {
                block[PROP] = ast;
            }

            return block;
        });
};