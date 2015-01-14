#!/usr/bin/env node
'use strict';

var program = require('commander');
var pkg = require('../package');

program
  .version(pkg.version)
  .option('-c, --coverage', '')
  .option('-h, --html <path>', 'Build and deploy html report.')
  .option('-m, --mask <pattern>', 'Sets custom mask for the readme files.')
  .option('-s, --silent', 'Suppress warnings.')
  .option('-l, --lint', '')
  .option('-t, --threshold <number>', 'Sets custom threshold for the linter.')
  .parse(process.argv);

if (program.args.length === 0) {
  program.help();
}

var Tree = require('../lib/tree');

var tree = new Tree(program.args);

tree.once('done', checkForTechs);
tree.read();

function checkForTechs() {
  tree.once('done', function () {
    console.log(tree);
  });
  tree.getTechs('?.js', function () {});
  tree.getTechs('README.md', function () {});
}
