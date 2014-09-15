'use strict';

var marked = require('marked');

module.exports = function (string) {
    return marked(string);
};
