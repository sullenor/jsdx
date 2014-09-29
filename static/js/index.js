/*global $,Backbone,provide*/
(function () {
    'use strict';

    function buildJs(ast) {
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

    var Block = Backbone.View.extend({
        initialize: function (block) {
            this.block = block;
            return this.render();
        },

        tagName: 'li',

        events: {
            'click a': 'clickHandler'
        },

        clickHandler: function () {
            if (!this.block.js && !this.block.md) {
                $('main').html(':(');
                return false;
            }

            $('main').empty();
            var a;

            if (this.block.js) {
                a = $('<a class="my-button" href="#">Javascript API</a>');
                a.on('click', this.showJs.bind(this));
                $('main').append(a);
            }

            if (this.block.md) {
                a = $('<a class="my-button" href="#">Документация</a>');
                a.on('click', this.showMd.bind(this));
                $('main').append(a);
            }

            $('main').append('<section></section>');
        },

        showJs: function (e) {
            e.preventDefault();

            $('section').html(buildJs(this.block.js));
        },

        showMd: function (e) {
            e.preventDefault();

            $('section').html(this.block.md);
        },

        render: function () {
            this.$el.append('<a href="#' + this.block.name + '">' + this.block.name + '</a>');
            return this;
        }
    });

    var List = Backbone.View.extend({
        initialize: function (list) {
            this.list = list;
            return this.render();
        },

        tagName: 'ul',

        className: 'my-nav',

        render: function () {
            this.list.forEach(function (block) {
                this.$el.append(new Block(block).$el);
            }, this);
            return this;
        }
    });

    var Header = Backbone.View.extend({
        initialize: function (text, list) {
            this.list = list;
            this.text = text;
            return this.render();
        },

        tagName: 'h2',

        events: {
            'click': 'clickHandler'
        },

        clickHandler: function () {
            this.list && this.list.$el.toggle();
        },

        render: function () {
            this.$el.text(this.text);
            return this;
        }
    });

    var App = Backbone.View.extend({
        initialize: function (data) {
            this.name = data.name;
            this.nodes = data.nodes;
            return this.render();
        },

        $header: $('header'),

        $nav: $('nav'),

        render: function () {
            this.$header.empty()
                .append('<h1>' + this.name + '</h1>');

            this.$nav.empty();
            this.nodes.forEach(function (node) {
                var list = new List(node.content);
                this.$nav.append(new Header(node.name, list).$el, list.$el);
            }, this);

            return this;
        }
    });

    new App(provide());
})();
