#!/usr/bin/env node
'use strict';

var program = require('commander');
var pkg = require('../package');

program
    .version(pkg.version)
    .option('-c, --coverage', '')
    .option('-h, --html <path>', '')
    .option('-m, --mask <pattern>', '')
    .option('-s, --silent', 'Suppress warnings.')
    .option('-l, --lint', '')
    .option('-t, --threshold', '')
    .parse(process.argv);

program.help();
