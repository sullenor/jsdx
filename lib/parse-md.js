'use strict';

var ghm = require('github-flavored-markdown');

module.exports = function (string) {
    return ghm.parse(string);
};
