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

'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var inherits = require('util').inherits;
var path = require('path');

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

function Structure(directory) {
    var that = this;

    EventEmitter.call(this);

    fs.readdir(directory, function (err, files) {
        if (err) {
            return that.emit('error', err);
        }

        that.emit('files', files.map(_
            .compose(path.join.bind(path, directory), _.identity)));
    });
}

inherits(Structure, EventEmitter);
