/*global $,Backbone,provide*/
(function () {
    'use strict';

    /**
     * Моделька под блок.
     *
     * @field {string} name
     * @field {string} description
     * @field {string} js
     */
    var Block = Backbone.Model.extend({
        /**
         * @param  {object} ast
         * @param  {string} ast.name
         * @param  {object} ast.js
         * @param  {object} ast.md
         */
        initialize: function (ast) {
            this.set('name', ast.name);
            this.set('description', this.processMd(ast.md));
            this.set('js', this.processJs(ast.js));
        },

        /**
         * Форматирует исходное дерево. Возвращает html.
         *
         * @param  {object} ast
         * @return {string}
         */
        processJs: function (ast) {
            if (!ast) {
                return '';
            }
        },

        /**
         * Форматирует исходное дерево. Возвращает html.
         *
         * @param  {object} ast
         * @return {string}
         */
        processMd: function (ast) {
            if (!ast) {
                return '';
            }

            var buf = [];

            if (ast.mods) {
                buf.push('<h4>Модификаторы блока</h4>');
                buf.push('<ul>');
                ast.mods.forEach(function (mod) {
                    buf.push('<li>');
                    buf.push(mod.name);
                    if (mod.vals) {
                        buf.push('<ul>');
                        mod.vals.forEach(function (val) {
                            buf.push('<li>' + val.name + '</li>');
                        });
                        buf.push('</ul>');
                    }
                    buf.push('</li>');
                });
                buf.push('</ul>');
            }

            if (ast.elems) {
                buf.push('<h4>Элементы блока</h4>');
                buf.push('<ul>');
                ast.elems.forEach(function (elem) {
                    buf.push('<li>' + elem.name + '</li>');
                });
                buf.push('</ul>');
            }

            return buf.join('');
        }
    });

    var Item = Backbone.View.extend({
        tagName: 'a',

        className: 'item',

        attributes: {
            href: '#'
        },

        initialize: function (model) {
            this.render();
        },

        events: {
            click: 'show'
        },

        show: function (e) {
            e.preventDefault();
            $('main').html(this.model.get('description'));
        },

        render: function () {
            this.$el.html(this.model.get('name'));
            return this;
        }
    });

    // Общий каркас
    var App = Backbone.View.extend({
        el: 'body',

        initialize: function () {
            this.render();
        },

        getAst: function () {
            return provide();
        },

        render: function () {
            var ast = this.getAst();
            var level = ast.levels[0];

            level.blocks.forEach(function (block) {
                new Item({model: new Block(block)}).$el.appendTo(this.$el);
            }, this);

            return this;
        }
    });

    new App();
})();