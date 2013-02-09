/**
  * Copyright (c) 2013 Ivo Wetzel.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE.
  */
var Class = require('./Class').Class,
    utils = require('./utils').utils;

var List = Class(function(items, maxCount) {

    this._items = {};
    this._list = [];
    this.length = 0;

    if (items instanceof Array) {
        this._maxCount = maxCount || 0;
        utils.map(items, this.add, this);

    } else {
        this._maxCount = items || 0;
    }

}, {

    add: function(item) {

        var id = '#' + this._getId(item);
        if (!this._items.hasOwnProperty(id)) {

            utils.assert(this._maxCount === 0 || this.length < this._maxCount,
                         'List contains less than ' + this._maxCount + ' items');

            this._items[id] = item;
            this._list.push(item);
            this.length++;
            return true;

        } else {
            return false;
        }

    },

    remove: function(item) {

        var id = '#' + this._getId(item);
        if (this._items.hasOwnProperty(id)) {
            delete this._items[id];
            this._list.splice(this._list.indexOf(item), 1);
            this.length--;
            return true;

        } else {
            return false;
        }

    },

    get: function(id) {
        return this._items['#' + id];
    },

    has: function(item) {

        if (typeof item === 'number') {
            return this._items.hasOwnProperty('#' + item);

        } else {
            return this._items.hasOwnProperty('#' + this._getId(item));
        }

    },

    items: function() {
        return this._list.slice();
    },

    clear: function() {
        this._list.length = 0;
        this._items = {};
    },

    at: function(offset) {

        if (offset < 0) {
            offset += this._list.length;
        }

        return this._list[offset];

    },

    first: function() {
        return this.at(0);
    },

    last: function() {
        return this.at(-1);
    },

    reverse: function() {
        this._list.reverse();
    },

    each: function(callback, scope) {
        utils.each(this._list, callback, scope);
    },

    every: function(callback, scope) {
        return utils.every(this._list, callback, scope);
    },

    some: function(callback, scope) {
        return utils.some(this._list, callback, scope);
    },

    filter: function(callback, scope) {
        return new List(utils.filter(this._list, callback, scope));
    },

    map: function(callback, scope) {
        return new List(utils.map(this._list, callback, scope));
    },

    _getId: function(item) {

        if (typeof item.getId === 'function') {
            return item.getId();

        } else {
            utils.assert(item.id, 'item has a id');
        }

    }

});

exports.List = List;

