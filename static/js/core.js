(function () {
    'use strict';

    var BlockModel = Backbone.Model.extend({
        initialize: function (ast) {
            ast.js && this.set('js', processJs(ast.js));
            ast.md && this.set('md', processMd(ast.md));
            delete ast.path;

            return ast;
        }
    });

    var Blocks = Backbone.Collection.extend({
        model: BlockModel
    });

    var LevelModel = Backbone.Model.extend({
        initialize: function (ast) {
            this.blocks = new Blocks(ast.blocks);

            this.blocks.on('selected', this._onModelSelected, this);
        },

        _onModelSelected: function (model) {
            this.trigger('selected', model);
        }
    });

    var Levels = Backbone.Collection.extend({
        model: LevelModel
    });



    /**
     * Полученное дерево
     *
     * @type {object}
     */
    var Ast = new Levels(provide().levels);



    /**
     * Блок в списке меню
     *
     * @type {function}
     */
    var Block = Backbone.View.extend({
        tagName: 'a',

        className: 'block',

        initialize: function () {
            this.render();
        },

        events: {
            click: '_onModelSelected'
        },

        render: function () {
            var name = this.model.get('name');

            this.$el
                .attr('href', '#' + name)
                .html(name);

            return this;
        },

        /**
         * По клику пробрасывает модельку наверх до вьюхи App.
         *
         * @param {object} e
         */
        _onModelSelected: function (e) {
            e.preventDefault();
            this.model.trigger('selected', this.model)
        }
    });

    /**
     * Табик
     *
     * @type {function}
     */
    var Tab = Backbone.View.extend({
        tagName: 'a',

        className: 'tab',

        initialize: function (type) {
            this.type = type;
            this.render();
        },

        render: function () {
            var name;

            switch (this.type) {
            case 'js':
                name = 'JavaScript';
                break;
            case 'md':
                name = 'Документация';
                break;
            }

            this.$el
                .data('type', this.type)
                .html(name);

            return this;
        }
    });

    /**
     * Общий каркас.
     *
     * @type {function}
     */
    var App = Backbone.View.extend({
        el: 'body',

        initialize: function () {
            Ast.on('selected', this._onModelSelected, this);
            this.render();
        },

        events: {
            'click .tab': '_onTabClick'
        },

        render: function () {
            this.$el.find('aside,section').remove();

            var menu = this.menu = $('<aside></aside>');
            var main = this.main = $('<main></main>');
            var nav = this.nav = $('<nav></nav>');
            var section = $('<section></section>').append(nav, main);

            Ast.models.forEach(function (level) {
                menu.append('<h4>' + level.get('name') + '</h4>');

                level.blocks.models.forEach(function (block) {
                    menu.append(new Block({model: block}).el);
                }, menu);
            }, menu);

            this.$el.prepend(menu, section);
            return this;
        },

        /**
         * Обработчик выбора блока.
         *
         * @param  {object} model
         */
        _onModelSelected: function (model) {
            this._selectedModel = model;
            this._updateNavigation();
            return this;
        },

        /**
         * Обработчик клика по табу.
         *
         * @param  {object} e
         */
        _onTabClick: function (e) {
            var type = $(e.target).data('type');
            var data = this._selectedModel.get(type);

            e.preventDefault();

            this.main.html(data);
        },

        /**
         * Перерисовка навигации.
         *
         * @return {object}
         */
        _updateNavigation: function () {
            var model = this._selectedModel;

            this.nav.empty();

            if (!model) {
                return this;
            }

            if (model.has('md')) {
                this.nav.append(new Tab('md').el);
            }

            if (model.has('js')) {
                this.nav.append(new Tab('js').el);
            }

            this.main.html(model.get('md'));

            return this;
        }
    });

    new App();

    function processJs(ast) {
        if (!ast) {
            return '';
        }

        var buf = [];

        buf.push('<h3>' + ast.block + '</h3>');

        if (ast.baseBlock) {
            buf.push('<p>Наследуется от блока <b>' + ast.baseBlock + '</b>.</p>');
        }

        if (ast.blockMethods.length) {
            buf.push('<h4>Методы блока</h4>');
            ast.blockMethods.forEach(function (method) {
                buf.push('<h5>' + method.method + '()</h5>');
                if (method.comment) {
                    var comment = method.comment;
                    if (comment.description) {
                        buf.push('<p>' + comment.description + '</p>');
                    }
                    if (comment.tags.length) {
                        buf.push('<ul>');
                        comment.tags.forEach(function (tag) {
                            buf.push('<li>');
                            buf.push(tag.tag + ' ');
                            buf.push('<code>' + tag.types + '</code>' + ' ');
                            tag.name && buf.push(tag.name + ' ');
                            tag.description && buf.push(tag.description);
                            buf.push('</li>');
                        });
                        buf.push('</ul>');
                    }
                }
            });
        }

        if (ast.staticMethods.length) {
            buf.push('<h4>Статические методы</h4>');
            ast.staticMethods.forEach(function (method) {
                buf.push('<h5>' + method.method + '()</h5>');
                if (method.comment) {
                    var comment = method.comment;
                    if (comment.description) {
                        buf.push('<p>' + comment.description + '</p>');
                    }
                    if (comment.tags.length) {
                        buf.push('<ul>');
                        comment.tags.forEach(function (tag) {
                            buf.push('<li>');
                            buf.push(tag.tag + ' ');
                            buf.push('<code>' + tag.types + '</code>' + ' ');
                            tag.name && buf.push(tag.name + ' ');
                            tag.description && buf.push(tag.description);
                            buf.push('</li>');
                        });
                        buf.push('</ul>');
                    }
                }
            });
        }

        return buf.join('');
    }

    function processMd(ast) {
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
})();