'use strict';

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

function count(arr) {
    var covered = 0;
    var methods = 0;
    arr.forEach(function (method) {
        method.comment && covered++;
        methods++;
    });

    return [covered, methods];
}

exports.block = function (block) {
    if (!block.js) {
        return block;
    }

    var methods = [];
    block.js.blockMethods && methods.push(block.js.blockMethods);
    block.js.staticMethods && methods.push(block.js.staticMethods);

    block.js.coverage = sum.apply(null, methods.map(count));

    return block;
};

exports.total = function (node) {
    var reports = [];
    node.content.forEach(function (block) {
        block.js && reports.push(block.js.coverage);
    });

    node.coverage = sum.apply(null, reports);

    return node;
};
