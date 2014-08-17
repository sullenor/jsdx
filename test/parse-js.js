'use strict';

var expect = require('must');
var fs = require('fs');
var path = require('path');
var parse = require('../lib/parse-js');

describe('module parse-js', function () {
    it('v1', function () {
        var file = fs.readFileSync(path.resolve(__dirname, './fixtures/input.v1.js'), {encode: 'utf-8'});
        var bem = parse(file);
        expect(bem).to.exist();
        expect(bem).to.be.object();
    });

    it('v2', function () {
        var file = fs.readFileSync(path.resolve(__dirname, './fixtures/input.v2.js'), {encode: 'utf-8'});
        var bem = parse(file);
        expect(bem).to.exist();
        expect(bem).to.be.object();
    });
});
