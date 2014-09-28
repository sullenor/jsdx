'use strict';

/**
 * Считает покрытие по наличию блочного комментария (свойство comment).
 *
 * @param  {array} methods Список методов.
 * @return {array}
 */
function count(methods) {
    var covered = 0;
    var total = 0;

    methods.forEach(function (method) {
        method.comment && covered++;
        total++;
    });

    return [covered, total];
}

/**
 * Считает покрытие блока документацией.
 *
 * js: сумма комментариев против количества методов
 * md: наличие ".ru.md" файлика у блока
 *
 * @param  {object} block
 * @return {object}
 */
function processBlock(block) {
    block.coverage = {};

    block.coverage.js = block.js ?
        count([].concat(block.js.blockMethods, block.js.staticMethods)) :
        [0, 0];

    block.coverage.md = block.md && block.md.md ?
        [1, 1] :
        [0, 1];

    return block;
}

/**
 * Считает покрытие по блокам и суммирует его.
 *
 * @param  {object} level
 * @return {object}
 */
function processLevel(level) {
    var js = [];
    var md = [];

    level.blocks.forEach(function (block) {
        processBlock(block);
        js.push(block.coverage.js);
        md.push(block.coverage.md);
    });

    level.coverage = {
        js: sum.apply(null, js),
        md: sum.apply(null, md)
    };

    return level;
}

/**
 * Суммирует отчеты.
 *
 * @return {array}
 */
function sum() {
    var covered = 0;
    var methods = 0;
    var ln = arguments.length;

    for (var i = 0; i < ln; ++i) {
        covered += arguments[i][0];
        methods += arguments[i][1];
    }

    return [covered, methods];
}

/**
 * Формирует отчет по покрытию кода документацией.
 *
 * @todo   Вытаскивать список технологий из конфига.
 * @param  {object} ast
 * @return {object}
 */
module.exports = function (ast) {
    ast.levels.forEach(processLevel);

    return ast;
};