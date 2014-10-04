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

            this.main.html(JSON.stringify(data));
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

            return this;
        }
    });

    new App();
})();