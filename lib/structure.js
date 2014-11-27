/**
 * Возможная структура проекта.
 *
 * Общее описание:
 *
 * {
 *     name: 'Project name',
 *     path: 'Path to directory',
 *     levels: [...]
 * }
 *
 * Описание уровня:
 *
 * {
 *     name: 'Level name',
 *     path: 'Path to directory',
 *     blocks: [...]
 * }
 *
 * Описание блока:
 *
 * {
 *     name: 'Block name',
 *     path: 'Path to directory',
 *     elems: [...],
 *     mods: [...]
 * }
 *
 * Описание элементов:
 *
 * {
 *     name: 'Element name',
 *     path: 'Path to directory',
 *     mods: [...]
 * }
 *
 * Описание модификаторов:
 *
 * {
 *     name: 'Mod name',
 *     path: 'Path to directory',
 *     vals: [
 *         {
 *             name: 'Mod val name',
 *             path: 'Path to file'
 *         },
 *         ...
 *     ]
 * }
 */

var fs = require('fs');
var path = require('path');

function readdirThoroughly(directory, next) {
    fs.readdir(directory, function (err, list) {
        if (err) {
            return next(err);
        }

        list.forEach(function (file) {
            fs.stat(path.join(directory, file), function (err, stats) {});
        });

        next(null, dirs, files);
    });
}

/**
 * Проверяет, является ли папка элементом.
 *
 * @return {Boolean}
 */
function isElem() {}

/**
 * Проверяет, является ли папка модификатором.
 *
 * @return {Boolean}
 */
function isMod() {}

/**
 * Проверяет, является ли файл значением модификатора.
 *
 * @return {Boolean}
 */
function isVal() {}
