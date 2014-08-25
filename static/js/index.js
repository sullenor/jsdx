/*global $,Backbone,provide*/
(function () {
    'use strict';

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
            if (!this.block.js) {
                $('main').html(':(');
                return false;
            }

            var js = this.block.js;
            var buf = [];

            buf.push('<h3>' + js.block + '</h3>');

            if (js.baseBlock) {
                buf.push('<p>Наследуется от блока <b>' + js.baseBlock + '</b>.</p>');
            }

            if (js.blockMethods.length) {
                buf.push('<h4>Методы блока</h4>');
                js.blockMethods.forEach(function (method) {
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
                            }, this);
                            buf.push('</ul>');
                        }
                    }
                }, this);
            }

            if (js.staticMethods.length) {
                buf.push('<h4>Статические методы</h4>');
                js.staticMethods.forEach(function (method) {
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
                            }, this);
                            buf.push('</ul>');
                        }
                    }
                }, this);
            }

            $('main').html(buf.join(''));
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

    var app = new App(provide());
})();
