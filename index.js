'use strict';

var getBlocks = require('./lib/blocks');
var path = require('path');
var Promise = require('vow').Promise;
var util = require('util');

/**
 * Сформирует список уровней с блоками и складывает их в astLevels.
 *
 * @param  {array}   astLevels Результирующий массив.
 * @param  {array}   levels    Список относительных путей.
 * @return {promise}
 */
function buildLevels(astLevels, levels) {
    return Promise.all(levels.map(function (level) {
        level = {name: path.basename(level), path: path.resolve(level)};

        return getBlocks(level.path)
            .then(function (blocks) {
                level.blocks = blocks;
                astLevels.push(level);

                return level;
            });
    }));
}

/**
 * Натравливает технологии на блоки.
 *
 * @param  {array}   techs
 * @param  {array}   levels
 * @return {promise}
 */
function runTechs(techs, levels) {
    return Promise.all(techs.map(loadTech))
        .then(function (loadedTechs) {
            return Promise.all(levels.map(function (level) {
                return Promise.all(level.blocks
                    .map(launchTechs.bind(null, loadedTechs))); // Плохо
            }));
        });
}

/**
 * Подгружает модуль с соответствующей технологией.
 *
 * @param  {string}  tech
 * @return {promise}
 */
function loadTech(tech) {
    return new Promise(function (resolve, reject) {
        var modulePath = util.format('./lib/tech-%s', tech);

        try {
            tech = require(modulePath);
        } catch(e) {
            return reject(util
                .format('Sorry, can\'t find module "%s" for the "%s" tech.', path.basename(modulePath), tech));
        }

        resolve(tech);
    });
}

/**
 * Прогоняет указанные технологии для переданного блока.
 *
 * @param  {array}   techs Модули.
 * @param  {object}  block
 * @return {promise}
 */
function launchTechs(techs, block) {
    return Promise.all(techs.map(function (tech) {
        return tech(block);
    }));
}

/**
 * Собирает документацию по заданным уровням с блоками.
 *
 * @param  {(string|string[])} levels
 * @return {promise}
 */
module.exports = function (levels, options) {
    Array.isArray(levels) ||
        (levels = [levels]);

    options = options || {};

    Array.isArray(options.techs) ||
        (options.techs = ['js', 'md']);

    var ast = {levels: []};

    return buildLevels(ast.levels, levels)
        .then(runTechs.bind(null, options.techs))
        .then(function () {
            return ast;
        });

    // Получаем список блоков по всем уровням
    // Получаем список файлов для технологий
    // Парсим файлы
    // Возвращаем данные
    //
    // Хочется в рамках этого модуля иметь абстракную структуру
};
