'use strict';

/**
 * Оставляет отчет по покрытию.
 *
 * @todo   Прокинуть конфиг со списком технологий.
 * @param  {object} ast
 * @return {object}
 */
module.exports = function (ast, config) {
    var coverage = ast.levels.reduce(function (report, level) {
        report[level.name] = level.blocks.reduce(function (result, block) {
            var js = block.coverage.js;
            var md = block.coverage.md;

            result[block.name] = {
                js: js[1] ? (js[0] / js[1]).toFixed(1) : '-.-',
                md: md[1] ? (md[0] / md[1]).toFixed(1) : '-.-'
            };

            return result;
        }, {});

        return report;
    }, {});

    return [coverage, config];
};
