'use strict';

/**
 * Оставляет отчет по покрытию.
 *
 * @todo   Прокинуть конфиг со списком технологий.
 * @param  {object} ast
 * @return {object}
 */
module.exports = function (ast) {
    var coverage = {};

    ast.levels.forEach(function (level) {
        coverage[level.name] = level.coverage;
    });

    return coverage;
};