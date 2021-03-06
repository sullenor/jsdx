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
            var cov = this.model.get('coverage');
            var name = this.model.get('name');

            if (cov) {
                this.$el
                    .attr('data-js', cov.js[0] ? (cov.js[0] / cov.js[1]).toFixed(4) : 0)
                    .attr('data-md', Boolean(cov.md[0]))
                    .attr('href', '#' + name)
                    .html(name);
            } else {
                this.$el
                    .attr('href', '#' + name)
                    .html(name);
            }

            if (!this.model.has('js') && !this.model.has('md')) {
                this.$el.addClass('disabled');
            }

            return this;
        },

        /**
         * По клику пробрасывает модельку наверх до вьюхи App.
         *
         * @param {object} e
         */
        _onModelSelected: function (e) {
            e.preventDefault();
            if (this.model.has('js') || this.model.has('md')) {
                this.model.trigger('selected', this.model);
            }
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
                var header = $(wrap('h2', level.get('name')));

                if (level.blocks && level.blocks.models && level.blocks.models[0].get('coverage')) {
                    var total = level.blocks.models.reduce(function (cov, block) {
                        var c = block.get('coverage');

                        cov.js[0] += c.js[0];
                        cov.js[1] += c.js[1];
                        cov.md[0] += c.md[0];
                        cov.md[1] += c.md[1];

                        return cov;
                    }, {js: [0, 0], md: [0, 0]});

                    var js = total.js[0] ? (total.js[0] / total.js[1]).toFixed(4) : 0;
                    var md = total.md[0] ? (total.md[0] / total.md[1]).toFixed(4) : 0;

                    header
                        .attr('data-js', js)
                        .attr('data-md', md)
                        .append('<div class="report">js: ' + js * 100 + '%; md: ' + md * 100 + '%</div>');
                }

                menu.append(header);

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

        buf.push(wrap('h3', ast.block));

        if (ast.baseBlock) {
            buf.push('<p>Наследуется от блока <b>' + ast.baseBlock + '</b>.</p>');
        }

        if (Array.isArray(ast.blockMethods) && ast.blockMethods.length) {
            buf.push(wrap('h4', 'Методы блока'));
            ast.blockMethods.forEach(processMethod.bind(null, buf));
        }

        if (Array.isArray(ast.staticMethods) && ast.staticMethods.length) {
            buf.push(wrap('h4', 'Статические методы'));
            ast.staticMethods.forEach(processMethod.bind(null, buf));
        }

        return buf.join('');
    }

    function processMethod(buf, method) {
        buf.push(wrap('h5', method.method + '()'));
        if (method.comment) {
            var comment = method.comment;
            if (comment.description) {
                buf.push(wrap('p', comment.description));
            }
            if (comment.tags.length) {
                buf.push('<ul>');
                comment.tags.forEach(function (tag) {
                    buf.push('<li>');
                    buf.push(tag.tag);
                    if (Array.isArray(tag.types)) {
                        if (tag.types.length) {
                            tag.types.forEach(function (type) {
                                buf.push(' ' + wrap('code', type));
                            });
                        } else {
                            buf.push(' ' + wrap('code', '*'));
                        }
                    }
                    if (tag.name) {
                        buf.push(' ' + wrap('i', tag.name));
                    }
                    if (tag.description) {
                        buf.push(' ' + tag.description);
                    }
                    buf.push('</li>');
                });
                buf.push('</ul>');
            }
        } else {
            if (method.args) {
                buf.push('<ul>');
                method.args.forEach(function (arg) {
                    buf.push('<li>param');
                    buf.push(' ' + wrap('code', '*') + ' ');
                    buf.push(wrap('i', arg));
                    buf.push('</li>');
                });
                buf.push('</ul>');
            }
        }
    }

    function processMd(ast) {
        if (!ast) {
            return '';
        }

        var buf = [];

        if (ast.description) {
            buf.push(downgradeHeaders(ast.description));
        }

        if (ast.mods) {
            buf.push('<h4>Модификаторы блока</h4>');
            buf.push('<ul>');
            ast.mods.forEach(function (mod) {
                buf.push('<li>');
                buf.push(mod.name);
                if (mod.description) {
                    buf.push(downgradeHeaders(mod.description));
                }
                if (mod.vals) {
                    buf.push('<ul>');
                    mod.vals.forEach(function (val) {
                        buf.push(wrap('li', val.name));
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
                buf.push('<li>');
                buf.push(elem.name);
                if (elem.description) {
                    buf.push(downgradeHeaders(elem.description));
                }
                buf.push('</li>');
            });
            buf.push('</ul>');
        }

        return buf.join('');
    }

    function downgradeHeaders(string) {
        return string
            .replace(/(<\/?h)5([^>]*?>)/gi, '$16$2')
            .replace(/(<\/?h)4([^>]*?>)/gi, '$16$2')
            .replace(/(<\/?h)3([^>]*?>)/gi, '$15$2')
            .replace(/(<\/?h)2([^>]*?>)/gi, '$14$2')
            .replace(/(<\/?h)1([^>]*?>)/gi, '$13$2');
    }

    function wrap(tag, text) {
        return '<' + tag + '>' + text + '</' + tag + '>';
    }
})();
