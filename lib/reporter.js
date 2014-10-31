'use strict';

var colors = require('colors-mini');

module.exports = function (ast) {
    for (var levelName in ast) {
        var level = ast[levelName];

        process.stdout.write(levelName + '\n');

        for (var blockName in level) {
            var block = level[blockName];

            process.stdout.write(colors.grey('- ') + blockName);
            process.stdout.write(colors.grey(' [ '));
            process.stdout.write('js: ' + block.js);
            process.stdout.write(' / ');
            process.stdout.write('md: ' + block.md);
            process.stdout.write(colors.grey(' ]') + '\n');
        }
    }
};
