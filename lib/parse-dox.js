'use strict';

/**
 * Парсер тегов.
 *
 * @param  {string} string
 * @return {object}
 */
function parseTag(string) {
    var tag = {};
    var parts = string.split(/ +/);
    var type = tag.tag = parts.shift().replace('@', '').toLowerCase();

    switch (type) {
    case 'const':
        break;
    case 'constant':
        break;
    case 'deprecated':
        break;
    case 'param':
        tag.types = parseTagTypes(parts.shift());
        tag.name = parseParamArg(parts.shift());
        tag.description = parts.join(' ');
        break;
    case 'protected':
        break;
    case 'private':
        break;
    case 'public':
        break;
    case 'return':
        tag.types = parseTagTypes(parts.shift());
        tag.description = parts.join(' ');
        break;
    case 'returns':
        tag.types = parseTagTypes(parts.shift());
        tag.description = parts.join(' ');
        break;
    case 'type':
        tag.types = parseTagTypes(parts.shift());
        tag.description = parts.join(' ');
        break;
    default:
        tag.description = parts.join(' ');
    }

    return tag;
}

/**
 * Парсер аргумента тега param.
 *
 * @param  {string} string
 * @return {string}
 */
function parseParamArg(string) {
    return string || '';
}

/**
 * Парсер типов тега.
 *
 * @param  {string} string
 * @return {*}      ?
 */
function parseTagTypes(string) {
    return string.replace(/[{}]/g, '');
}

/**
 * Парсит блочный комментарий.
 *
 * @param  {string} string
 * @return {object}
 */
module.exports = function (string) {
    // Чистка мусора
    string = string
        .replace(/\r\n/gm, '\n')
        .replace(/[ \t]*\* ?/gm, '').trim()
        .replace(/\n+@/gm, '\n@')
        .replace(/\n([^@])/gm, ' $1')
        .replace(/ +/gm, ' ');

    // Комментарий
    var comment = {tags: []};
    comment.description = string.split('\n@')[0];

    // Парсинг тегов
    if (string.indexOf('\n@') > -1) {
        var tags = string.substr(string.indexOf('\n@') + 1);
        comment.tags = tags.split('\n').map(parseTag);
    }

    return comment;
};