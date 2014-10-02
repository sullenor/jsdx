(function () {
    'use strict';

    var BlockModel = Backbone.Model.extend({
        initialize: function (ast) {
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
     * Вьюха для блока. Отображается в качетве элемента бокового меню.
     *
     * @return {object}
     */
    var Block = Backbone.View.extend({
        tagName: 'a',

        className: 'menu-item',

        initialize: function () {
            this.render();
        },

        events: {
            click: '_onClick'
        },

        render: function () {
            var name = this.model.get('name');

            this.$el
                .attr('href', '#' + name)
                .html(name);

            return this;
        },

        _onClick: function () {
            this.model.trigger('selected', this.model);
        }
    });

    var Nav = Backbone.View.extend({
        tagName: 'nav',

        initialize: function () {
            this.render();
        },

        render: function () {
            var model = this.model;

            this.$el.empty();

            if (!model) {
                return this;
            }

            if (model.has('js')) {
                this.$el.append('Описание');
            }

            if (model.has('md')) {
                this.$el.append('JavaScript');
            }

            return this;
        },

        setModel: function (model) {
            this.model = model;
            this.render();
        }
    });

    var App = Backbone.View.extend({
        el: 'body',

        initialize: function () {
            Ast.on('selected', this._onModelSelected, this);
            this.render();
        },

        render: function () {
            console.time('Render');
            this.$el.find('aside,main').remove();

            this.menu = $('<aside>');
            this.main = $('<main>');
            this.nav = new Nav();

            Ast.models.forEach(function (level) {
                this.menu.append('<h2>' + level.get('name') + '</h2>');

                if (level.blocks.models.length) {
                    level.blocks.models.forEach(function (block) {
                        this.menu.append(new Block({model: block}).$el);
                    }, this);
                }
            }, this);

            this.$el.prepend(this.menu, this.nav.$el, this.main);

            console.timeEnd('Render');
            return this;
        },

        _onModelSelected: function (model) {
            this.nav.setModel(model);
        }
    });

    new App();
})();